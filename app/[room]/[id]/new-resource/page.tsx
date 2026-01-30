"use client"
import Field from "@/lib/Field";
import { KeypadContext, keyPadLayout } from "@/lib/Keypad";
import StatusBar from "@/lib/StatusBar";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use, useCallback, useContext, useEffect, useRef, useState } from "react";

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


export default function NewResource({ params }: p) {
   const router = useRouter();
   const { room, id } = use(params);

   const [name, setName] = useState<string>("");
   const [max, setMax] = useState<number>(0);
   const [desc, setDesc] = useState<string>("");
   const [regainOn, setRegainOn] = useState<number>(4);
   const parent = useRef<number | null>(undefined);

   const [charName, setCharName] = useState<string>("");

   const goBack = useCallback(() => {
      router.push(`/${room}/${parent.current ? parent.current : id}/resources`);
   }, [router, room, id]);

   useEffect(() => {
      supabase.from('Character').select().eq('id', parseInt(id)).single().then(({ data, error }) => {
         if (error) {
            console.error(error);
            router.push('/');
            return;
         }
         setCharName(data.name);
         parent.current = data.parent;
      })
   }, [id, router]);



   const submitNewRes = useCallback(async () => {
      if (isNaN(max) || max < 1 || name === "" || isNaN(parseInt(id)) || regainOn < 0 || regainOn > 4) return;
      const c = {
         name: name,
         current: max,
         max: max,
         desc: desc,
         parent: parseInt(id),
         regain_on: regainOn,
      }
      const { data, error } = await supabase.from('Resource').insert(c).select().single();
      if (error) console.error(error)
      else {
         router.push(`/${room}/${parent.current ? parent.current : id}/resources`)
      }
   }, [max, name, room, router, id, regainOn, desc]);

   const handleClick = useCallback((val: string) => {
      switch (val) {
         case "BACK":
            router.push(`/${room}/${parent.current ? parent.current : id}/resources`);
            break;
         case "CONFIRM":
            submitNewRes();
            break;
      }
   }, [router, submitNewRes, room, id]);

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
                  New Resource
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
         </div>
      </div >
   )

}
