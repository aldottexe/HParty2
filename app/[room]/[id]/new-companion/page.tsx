"use client"

import Field from "@/lib/Field";
import { KeypadContext, keyPadLayout } from "@/lib/Keypad";
import StatusBar from "@/lib/StatusBar";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use, useCallback, useContext, useEffect, useState } from "react"

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

export default function NewCompanion({ params }: p) {
   const { room, id } = use(params)
   const router = useRouter();

   const [name, setName] = useState("");
   const [maxhp, setMaxhp] = useState(0);

   const keyPad = useContext(KeypadContext);


   const submitNewChar = useCallback(async () => {
      if (isNaN(maxhp) || maxhp < 1 || name === "") return;
      const c = {
         name: name,
         current_hp: maxhp,
         max_hp: maxhp,
         temp_hp: 0,
         room: parseInt(room),
         parent: parseInt(id)
      }
      const { data, error } = await supabase.from('Character').insert(c).select().single();
      if (error) console.error(error)
      else {
         router.push(`/${room}/${id}?companion=${data.id}`)
      }
   }, [id, maxhp, name, room, router]);

   const handleClick = useCallback((val: string) => {
      switch (val) {
         case "BACK":
            router.push(`/${room}/${id}`);
            break;
         case "CONFIRM":
            submitNewChar();
            break;
      }
   }, [id, room, router, submitNewChar]);

   useEffect(() => {
      if (keyPad)
         keyPad({
            layout: keyLayout,
            onClick: handleClick,
         })
   }, [handleClick, keyPad]);

   return (
      <div className="flex flex-col h-full">
         <StatusBar roomNum={room} onLeave={() => { router.push('/') }} />
         <div className="flex flex-col gap-10 flex-1 justify-center">
            <h1 className="text-2xl text-g1 underline font-bold">
               New Character
            </h1>
            <Field id="charName" label="Name" type="text" value={name} setValue={setName} />
            <Field id="charName" label="Max HP" type="number" value={maxhp} setValue={setMaxhp} />
         </div>
      </div>
   )
}
