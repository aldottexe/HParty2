"use client"

import HPBar, { PlayerBar } from "@/lib/HPBar";
import { ResListClickable } from "@/lib/HPList";
import { PopupManagerContext } from "@/lib/PopupManager";
import StatusBar from "@/lib/StatusBar";
import { useLiveCharData, useLiveResourceData } from "@/lib/useLiveData";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { KeypadContext, keyPadLayout } from "@/lib/Keypad";


function Editor({ selected, onEdit }: { selected: Tables<'Resource'>, onEdit: (id: number) => void }) {
   const [currentHP, setCurrentHP] = useState(selected.current)

   async function inc() {
      if (currentHP >= selected.max) return;
      const { error } = await supabase.from('Resource').update({ current: currentHP + 1 }).eq('id', selected.id).select().single();
      if (error) {
         console.error(error);
      }
      setCurrentHP(c => c + 1)
   }

   async function dec() {
      if (currentHP < 1) return;
      const { error } = await supabase.from('Resource').update({ current: currentHP - 1 }).eq('id', selected.id).select().single();
      if (error) {
         console.error(error);
      }
      setCurrentHP(c => c - 1)
   }

   return (
      <div className="flex flex-col gap-2 w-80">
         <HPBar
            name={<b>{selected.name}</b>}
            current={currentHP}
            max={selected.max ?? 0}
            temp={0}
         />
         <p>{selected.desc}</p>
         <div className="flex text-w gap-2">
            <button
               className="bg-blue w-full hover:bg-dblue transition-colors rounded-lg"
               onClick={dec}
            >-</button>
            <button
               className="bg-blue w-full hover:bg-dblue transition-colors rounded-lg"
               onClick={inc}
            >+</button>
            <button
               className="bg-blue hover:bg-dblue transition-colors rounded-lg px-3"
               onClick={() => onEdit(selected.id)}
            >...</button>
         </div>
      </div>
   );
}

const layout: keyPadLayout = [
   [
      {
         name: "ADD RESOURCE",
         style: "h-8 border-g3 bg-g2 hover:bg-g3"
      },
      {
         name: "HP",
         style: "h-8 border-dblue bg-blue hover:bg-dblue"
      }
   ]
]

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}
export default function Resources({ params }: p) {
   const router = useRouter();
   const { room, id } = use(params);

   const { charData, synced: charSynced } = useLiveCharData(parseInt(room));

   const meAndCompanions = charData.filter((c) => c.id === parseInt(id) || c.parent === parseInt(id));
   const mainCharName = charData.find(c => c.id.toString() === id)?.name;

   const searchParams = useSearchParams();
   const initialSelectedCompanionID = parseInt(searchParams.get("companion") || id);
   const [selectedCompanionID, setSelectedCompanionID] = useState(initialSelectedCompanionID);

   const { resData, synced: resSynced } = useLiveResourceData(selectedCompanionID);

   const popupManager = useContext(PopupManagerContext);

   const setKeys = useContext(KeypadContext);
   useEffect(() => {
      if (setKeys)
         setKeys({
            layout: layout,
            onClick: (name: string) => {
               switch (name) {
                  case "ADD RESOURCE":
                     router.push(`/${room}/${selectedCompanionID}/new-resource`)
                     break;
                  case "HP":
                     router.push(`/${room}/${id}/`)
               }
            }
         });
   }, [id, room, router, setKeys, selectedCompanionID]);

   function edit(id: number) {
      const selectedRes = resData.find(r => r.id === id);

      let destroyPopup: (() => void) | undefined;
      function onEdit(id: number) {
         router.push(`/${room}/${id}/edit-resource`);
         if (destroyPopup)
            destroyPopup();

      }

      if (selectedRes)
         destroyPopup = popupManager?.enqueuePopup((
            <Editor selected={selectedRes} onEdit={onEdit} />
         ),
            { exitOnBackgroundClick: true }
         )
   }

   return (
      <div className="flex flex-col min-h-0 flex-1">
         <div className="flex flex-col min-h-0 flex-1 gap-5">
            <StatusBar
               roomNum={room}
               synced={resSynced && charSynced}
               charName={mainCharName}
               onLeave={() => { router.push('/') }}
            />
            <PlayerBar
               selectedID={selectedCompanionID}
               charList={meAndCompanions}
               onCharSelect={setSelectedCompanionID}
               onAddChar={() => { router.push(`/${room}/${id}/new-companion`) }}
               onCharScreen={() => { router.push(`/${room}/${id}/companions?from-resources=true`) }}
            />
            <div>
               <button className="bg-blue text-w rounded-lg px-2">Concentrate</button>
            </div>
            <ResListClickable resData={resData} onClick={edit} />
         </div>
      </div>
   )
}
