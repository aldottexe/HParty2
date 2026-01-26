"use client"
import Field from "@/lib/Field";
import Keypad from "@/lib/Keypad";
import Screen from "@/lib/Screen";
import StatusBar from "@/lib/StatusBar";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { keyPadLayout } from "@/lib/Keypad";
import { supabase } from "@/lib/supabaseClient";

interface hitDiceProps {
   type: string;
   quantity: number;
}

const keyLayout: keyPadLayout = [
   [
      { name: "BACK", style: "h-8 border-g3 bg-g2" },
      { name: "CONFIRM", style: "h-8 border-dblue bg-blue" },
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
   const { room } = use(params);

   const [name, setName] = useState("");
   const [maxhp, setMaxhp] = useState(0);
   const [hitDice, setHitDice] = useState<hitDiceProps[]>([]);

   async function submitNewChar() {
      if (isNaN(maxhp) || maxhp < 1 || name === "") return;
      const c = {
         name: name,
         current_hp: maxhp,
         max_hp: maxhp,
         temp_hp: 0,
         room: parseInt(room)
      }
      const { data, error } = await supabase.from('Character').insert(c).select().single();
      if (error) console.error(error)
      else {
         router.push(`/${room}/${data.id}`)
      }
   }

   function handleClick(val: string) {
      switch (val) {
         case "BACK":
            router.push('/');
            break;
         case "CONFIRM":
            submitNewChar();
            break;
      }
   }

   return (
      <div className="flex flex-col h-full">
         <Screen>
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
         </Screen>
         <Keypad layout={keyLayout} onClick={handleClick} />
      </div>
   )

}
