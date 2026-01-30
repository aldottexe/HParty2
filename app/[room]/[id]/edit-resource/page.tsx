"use client"
import Field from "@/lib/Field";
import { KeypadContext, keyPadLayout } from "@/lib/Keypad";
import StatusBar from "@/lib/StatusBar";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use, useCallback, useContext, useEffect, useRef, useState } from "react";
import { PopupManagerContext } from "@/lib/PopupManager";

const keyLayout: keyPadLayout = [[
   { name: "BACK", style: "h-8 border-g3 bg-g2" },
   { name: "CONFIRM", style: "h-8 border-dblue bg-blue" },
]]

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}

const radioOptions = [
   "Fill on short rest",
   "Fill on long rest",
   "Gain charges on short rest",
   "Gain charges on long rest",
   "None"
];

export default function EditResource({ params }: p) {
   const router = useRouter();
   const { room, id } = use(params);

   const [name, setName] = useState<string>("");
   const [max, setMax] = useState<number>(0);
   const [desc, setDesc] = useState<string>("");
   const [regainOn, setRegainOn] = useState<number>(4);
   const [charName, setCharName] = useState<string>("Resources");
   const parent = useRef<number>(0);
   const grandparent = useRef<number | null>(null);
   const currentHp = useRef<number>(0);

   const popupManager = useContext(PopupManagerContext);

   const goBack = useCallback(() => {
      router.push(`/${room}/${grandparent.current ? grandparent.current : parent.current}/resources`);
   }, [router, room]);

   function deleteRes() {
      const close = popupManager?.enqueuePopup(
         <div>
            <h2 className="font-bold text-2xl underline mb-5 pr-20">
               Delete {name}?
            </h2>
            <button className="text-dred bg-g5 block w-full rounded-lg h-8 mb-2 hover:bg-g4 transition-colors" onClick={async () => {
               await supabase.from('Character').delete().eq('id', parseInt(id))
               router.push('/')
            }}>delete</button>
            <button onClick={() => { close?.call({}) }} className="bg-g5 px-2 rounded-lg block w-full h-8 hover:bg-g4 transition-colors">cancel</button>
         </div >
      )
   }

   useEffect(() => {
      supabase.from('Resource').select().eq('id', parseInt(id)).single().then(({ data, error }) => {
         if (error) {
            console.error(error);
            router.push('/');
            return;
         }
         console.log(data);
         setName(data.name);
         setMax(data.max);
         setDesc(data.desc || "");
         setRegainOn(data.regain_on);
         parent.current = data.parent;
         currentHp.current = data.current;

         supabase.from('Character').select().eq('id', data.parent).single().then(({ data: charData, error }) => {
            if (error) {
               console.error(error);
               router.push('/');
               return;
            }
            setCharName(charData.name);
            grandparent.current = charData.parent
         })
      })
   }, [id, router]);



   const submitNewRes = useCallback(async () => {
      if (isNaN(max) || max < 1 || name === "" || isNaN(parseInt(id)) || regainOn < 0 || regainOn > 4) return;
      const r = {
         name: name,
         current: Math.min(currentHp.current, max),
         max: max,
         desc: desc,
         regain_on: regainOn,
      }
      const { data, error } = await supabase.from('Resource').update(r).eq('id', parseInt(id)).select().single();
      if (error) console.error(error)
      else {
         goBack();
      }
   }, [max, name, id, regainOn, desc, goBack]);

   const handleClick = useCallback((val: string) => {
      switch (val) {
         case "BACK":
            goBack();
            break;
         case "CONFIRM":
            submitNewRes();
            break;
      }
   }, [submitNewRes, goBack]);

   const setKeys = useContext(KeypadContext);
   useEffect(() => {
      if (setKeys)
         setKeys({
            layout: keyLayout,
            onClick: handleClick,
         })
   }, [handleClick, setKeys]);

   return (
      <div className="flex flex-col min-h-0">
         <StatusBar roomNum={room} charName={charName} onLeave={() => { router.push('/') }} />
         <div className="flex flex-col justify-center gap-5">
            <div>
               <h2 className="text-blue">{charName}</h2>
               <h1 className="text-2xl text-g1 underline font-bold">
                  Edit Resource
               </h1>
            </div>
            <Field
               id="ResName"
               label="Name"
               type="text"
               value={name}
               setValue={setName}
               required
            />
            <Field
               id="max"
               label="Max"
               type="number"
               value={max}
               setValue={setMax}
               required
            />
            <Field
               id="Notes"
               label="Notes"
               type="textLong"
               value={desc}
               setValue={setDesc}
               placeHolder="gain d4 charges... etc"
            />
            <div className="ml-2">
               <h2 className="font-bold mb-2">Behavior</h2>
               {radioOptions.map((option, i) => (
                  <label key={i} className="flex items-center cursor-pointer">
                     <input
                        type="radio"
                        name="behavior"
                        checked={regainOn === i}
                        onChange={() => setRegainOn(i)}
                        className="w-5 h-5 cursor-pointer"
                     />
                     <span className="ml-3 text-base">{option}</span>
                  </label>
               ))}
            </div>
            <div className="flex justify-center mb-5">
               <button className="text-red hover:bg-red hover:text-w rounded-3xl px-2 transition-colors" onClick={deleteRes}>Delete Resource</button>
            </div>
         </div>
      </div>
   )

}
