"use client"

import { PlayerBar } from "@/lib/HPBar";
import HPList from "@/lib/HPList";
import Keypad, { keyPadLayout } from "@/lib/Keypad";
import Popup from "@/lib/Popup";
import Screen from "@/lib/Screen";
import { useLiveCharData } from "@/lib/useLiveData";
import { use, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StatusBar from "@/lib/StatusBar";
import { useRouter } from "next/navigation";

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}

export default function HPTracker({ params }: p) {
   const { room, id } = use(params);
   const { charData, synced } = useLiveCharData(parseInt(room));
   const [selectedCompanionID, setSelectedCompanionID] = useState(parseInt(id));
   const [workingVal, setWorkingVal] = useState(0);

   const selectedCompanionData = charData.find((c) => c.id == selectedCompanionID);
   const others = charData.filter((c) => c.id !== parseInt(id));
   const meAndCompanions = charData.filter((c) => c.id === parseInt(id) || c.parent === parseInt(id));

   const mainCharName = charData.find(c => c.id.toString() === id)?.name;
   const router = useRouter();

   function charSelect(id: number) {
      setSelectedCompanionID(id)
   }

   const buttonLayout: keyPadLayout = [
      [
         { name: 'EDIT', keyPress: 'e', style: 'h-8 text-blue bg-g2 border-g3 hover:bg-g3' },
         { name: 'ZZZ', keyPress: 'z', style: 'h-8 text-blue bg-g2 border-g3 hover:bg-g3' },
         { name: 'RESOURCES', keyPress: 'TAB', style: 'h-8 text-w bg-blue border-dblue hover:bg-dblue' },
      ],
      [
         { name: 1, keyPress: 1 },
         { name: 2, keyPress: 2 },
         { name: 3, keyPress: 3 },
      ],
      [
         { name: 4, keyPress: 4 },
         { name: 5, keyPress: 5 },
         { name: 6, keyPress: 6 },
      ],
      [
         { name: 7, keyPress: 7 },
         { name: 8, keyPress: 8 },
         { name: 9, keyPress: 9 },
      ],
      [
         { name: '<', keyPress: 'Backspace' },
         { name: 0, keyPress: 0 },
         { name: 'TEMP', keyPress: 't', style: 'h-12 text-yellow bg-g2 border-g3 hover:bg-g3' },
      ],
      [
         { name: 'DMG', keyPress: 'd', style: 'h-12 text-red bg-g2 border-g3 hover:bg-g3' },
         { name: 'HEAL', keyPress: 'h', style: 'h-12 text-green bg-g2 border-g3 hover:bg-g3' },
      ],
   ];

   async function heal(ammt: number): Promise<void> {
      if (ammt <= 0) return;
      if (!selectedCompanionData) return;
      const newHp = Math.min(selectedCompanionData.max_hp, selectedCompanionData.current_hp + ammt);
      await supabase.from('Character').update({ current_hp: newHp }).eq('id', selectedCompanionID);
   }

   async function damage(ammt: number): Promise<void> {
      if (ammt <= 0) return;
      if (!selectedCompanionData) return;
      const newTemp = Math.max(0, selectedCompanionData.temp_hp - ammt);
      const newHp = Math.max(0, selectedCompanionData.current_hp - Math.max(0, ammt - selectedCompanionData.temp_hp));
      await supabase.from('Character').update({ current_hp: newHp, temp_hp: newTemp }).eq('id', selectedCompanionID);
   }

   async function temp(ammt: number): Promise<void> {
      if (!selectedCompanionData) return;
      if (ammt <= selectedCompanionData.temp_hp) return;
      await supabase.from('Character').update({ temp_hp: ammt }).eq('id', selectedCompanionID);
   }

   function handleClick(input: string) {
      if (!isNaN(parseInt(input))) {
         setWorkingVal(val => val * 10 + parseInt(input));
      } else if (input === '<') {
         setWorkingVal(val => Math.floor(val / 10));
      } else {
         switch (input) {
            case "HEAL":
               heal(workingVal);
               break;
            case "DMG":
               damage(workingVal);
               break;
            case "TEMP":
               temp(workingVal);
               break;
            case "EDIT":
               router.push(`/${room}/${selectedCompanionID}/edit-character`);
               break;
            case "RESOURCES":
               router.push(`/${room}/${id}/resources${selectedCompanionID.toString() !== id ? "?companion=" + selectedCompanionID : ""}`);
               break;
         }
         setWorkingVal(0);
      }
   }

   return <div className="h-full flex flex-col">
      <Screen>
         {workingVal > 0 && (
            <Popup>
               <p className="text-3xl font-bold text-g1">{workingVal}</p>
            </Popup>
         )}
         <div className="flex flex-col h-full min-h-0">
            <StatusBar roomNum={room} synced={synced} charName={mainCharName} onLeave={() => { router.push('/') }} />
            <div className="flex-1 overflow-auto min-h-0">
               <HPList charData={others} />
            </div>
            <PlayerBar selectedID={selectedCompanionID} charList={meAndCompanions} onCharSelect={charSelect} onCharScreen={() => { }} onAddChar={() => { router.push(`/${room}/${id}/new-companion`) }} />
         </div>
      </Screen>
      <Keypad layout={buttonLayout} onClick={handleClick} />
   </div>
}
