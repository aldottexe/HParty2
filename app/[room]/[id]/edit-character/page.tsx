"use client"
import Field from "@/lib/Field";
import { KeypadContext } from "@/lib/Keypad";
import StatusBar from "@/lib/StatusBar";
import { useRouter } from "next/navigation";
import { use, useState, useEffect, useContext, useCallback } from "react";
import { keyPadLayout } from "@/lib/Keypad";
import { supabase } from "@/lib/supabaseClient";
import { PopupManagerContext } from "@/lib/PopupManager";

interface hitDiceProps {
   type: string;
   quantity: number;
}

const keyLayout: keyPadLayout = [
   [
      { name: "BACK", style: "h-8 border-g3 bg-g2 hover:bg-g3" },
      { name: "CONFIRM", style: "h-8 border-dblue bg-blue hover:bg-dblue" },
   ]
]

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}
export default function NewChracter({ params }: p) {
   const router = useRouter();
   const { room, id } = use(params);

   const [name, setName] = useState("");
   const [maxhp, setMaxhp] = useState(0);
   const [currenthp, setCurrentHP] = useState(0);
   const [parent, setParent] = useState(0);
   const [hitDice, setHitDice] = useState<hitDiceProps[]>([]);

   const popupManager = useContext(PopupManagerContext);

   const setKeyPad = useContext(KeypadContext);

   useEffect(() => {
      supabase.from('Character').select().eq('id', parseInt(id)).single().then(({ data, error }) => {
         if (error) {
            console.error(error);
            router.push('/');
            return;
         }
         setName(data.name);
         setMaxhp(data.max_hp);
         setCurrentHP(data.max_hp);
         setParent(data.parent || 0);
      })
   }, [id, router]);


   const submitNewChar = useCallback(async () => {
      if (isNaN(maxhp) || maxhp < 1 || name === "") return;
      const { data, error } = await supabase.from('Character').update({ name: name, max_hp: maxhp, current_hp: Math.min(currenthp, maxhp) }).eq('id', parseInt(id)).select().single();
      if (error) console.error(error)
      else {
         router.push(`/${room}/${data.parent || data.id}`)
      }
   }, [currenthp, maxhp, id, name, room, router])

   function deleteRes() {
      const close = popupManager?.enqueuePopup(
         <div>
            <h2 className="font-bold text-2xl mb-3 pr-20">
               Delete {name}?
            </h2>
            <div className="flex gap-2">
               <button onClick={() => { close?.call({}) }} className="bg-g5 px-2 rounded-xl block w-full h-8 hover:bg-g4 transition-colors">cancel</button>
               <button className="text-dred bg-g5 block w-full rounded-xl h-8 hover:bg-g4 transition-colors" onClick={async () => {
                  const { error } = await supabase.from('Character').delete().eq('id', parseInt(id))
                  if (error) {
                     console.error(error);
                     return;
                  }
                  close?.call({});
                  if (parent) {
                     router.push(`/${room}/${parent}`)
                  } else
                     router.push(`/`)
               }}>delete</button>
            </div>
         </div >
      )
   }

   useEffect(() => {
      if (setKeyPad)
         setKeyPad({
            layout: keyLayout,
            onClick: (val: string) => {
               switch (val) {
                  case "BACK":
                     router.push(`/${room}/${parent || id}`);
                     break;
                  case "CONFIRM":
                     submitNewChar();
                     break;
               }
            }
         })
   }, [id, parent, room, router, setKeyPad, submitNewChar]);

   return (
      <div className="flex flex-col h-full">
         <div className="flex flex-col h-full">
            <StatusBar roomNum={room} charName={name} onLeave={() => { router.push('/') }} />
            <div className="flex flex-col gap-10 flex-1 justify-center">
               <h1 className="text-2xl underline font-bold">
                  Edit {name || "chracter"}
               </h1>
               <Field id="charName" label="Name" type="text" value={name} setValue={setName} />
               <Field id="charName" label="Max HP" type="number" value={maxhp} setValue={setMaxhp} />
            </div>
            <div className="flex justify-center mb-5">
               <button className="text-red hover:bg-red hover:text-w rounded-3xl px-2 transition-colors" onClick={deleteRes}>Delete {name || "Character"}</button>
            </div>
         </div>
      </div>
   )

}
