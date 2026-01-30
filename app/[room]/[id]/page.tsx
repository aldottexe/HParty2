"use client"

import { PlayerBar } from "@/lib/HPBar";
import HPList from "@/lib/HPList";
import Popup from "@/lib/Popup";
import { useLiveCharData } from "@/lib/useLiveData";
import { use, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import StatusBar from "@/lib/StatusBar";
import { useRouter, useSearchParams } from "next/navigation";
import { KeypadContext } from "@/lib/Keypad";

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}

const keys = [
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
]

export default function HPTracker({ params }: p) {
   const { room, id } = use(params);
   const { charData, synced } = useLiveCharData(parseInt(room));

   const searchParams = useSearchParams();
   const initialSelectedCompanionID = parseInt(searchParams.get("companion") || id);

   const [selectedCompanionID, setSelectedCompanionID] = useState(initialSelectedCompanionID);
   const [workingVal, setWorkingVal] = useState(0);


   const setKeypad = useContext(KeypadContext);

   const selectedCompanionData = charData.find((c) => c.id == selectedCompanionID);
   const others = charData.filter((c) => c.id !== parseInt(id));
   const meAndCompanions = charData.filter((c) => c.id === parseInt(id) || c.parent === parseInt(id));

   const mainCharName = charData.find(c => c.id.toString() === id)?.name;
   const router = useRouter();

   function charSelect(id: number) {
      setSelectedCompanionID(id)
   }

   const heal = useCallback(async (ammt: number): Promise<void> => {
      if (ammt <= 0) return;
      if (!selectedCompanionData) return;
      const newHp = Math.min(selectedCompanionData.max_hp, selectedCompanionData.current_hp + ammt);
      await supabase.from('Character').update({ current_hp: newHp }).eq('id', selectedCompanionID);
   }, [selectedCompanionData, selectedCompanionID]);

   const damage = useCallback(async (ammt: number): Promise<void> => {
      if (ammt <= 0) return;
      if (!selectedCompanionData) return;
      const newTemp = Math.max(0, selectedCompanionData.temp_hp - ammt);
      const newHp = Math.max(0, selectedCompanionData.current_hp - Math.max(0, ammt - selectedCompanionData.temp_hp));
      await supabase.from('Character').update({ current_hp: newHp, temp_hp: newTemp }).eq('id', selectedCompanionID);
   }, [selectedCompanionData, selectedCompanionID]);

   const temp = useCallback(async (ammt: number): Promise<void> => {
      if (!selectedCompanionData) return;
      if (ammt <= selectedCompanionData.temp_hp) return;
      await supabase.from('Character').update({ temp_hp: ammt }).eq('id', selectedCompanionID);
   }, [selectedCompanionData, selectedCompanionID]);

   const handleClick = useCallback(
      (input: string) => {
         if (!isNaN(parseInt(input))) {
            setWorkingVal(val => val * 10 + parseInt(input));
         } else if (input === '<') {
            setWorkingVal(val => Math.floor(val / 10));
         } else {
            setWorkingVal(currentVal => {
               switch (input) {
                  case "HEAL":
                     heal(currentVal);
                     break;
                  case "DMG":
                     damage(currentVal);
                     break;
                  case "TEMP":
                     temp(currentVal);
                     break;
                  case "EDIT":
                     router.push(`/${room}/${selectedCompanionID}/edit-character`);
                     break;
                  case "RESOURCES":
                     router.push(`/${room}/${id}/resources${selectedCompanionID.toString() !== id ? "?companion=" + selectedCompanionID : ""}`);
                     break;
               }
               return 0;
            });
         }
      }, [damage, heal, room, router, temp, selectedCompanionID, id])

   useEffect(() => {
      if (setKeypad)
         setKeypad({
            layout: keys,
            onClick: handleClick
         });
   }, [handleClick, setKeypad]);

   return <div className="h-full flex flex-col">
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
         <PlayerBar
            selectedID={selectedCompanionID}
            charList={meAndCompanions}
            onCharSelect={charSelect}
            onCharScreen={() => { router.push(`/${room}/${id}/companions`) }}
            onAddChar={() => { router.push(`/${room}/${id}/new-companion`) }} />
      </div>
   </div>
}
