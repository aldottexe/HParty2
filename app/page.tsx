"use client"
import Field from "@/lib/Field";
import { HPListClickable } from "@/lib/HPList";
import Screen from "@/lib/Screen";
import { useLiveCharData } from "@/lib/useLiveData";
import { useState } from 'react'
import { useRouter } from "next/navigation";
import StatusBar from "@/lib/StatusBar";

export default function Home() {
   const [roomNum, setRoomNum] = useState<string>("");
   const { charData, synced } = useLiveCharData(parseInt(roomNum));
   const router = useRouter();

   return (
      <Screen>
         <div className="flex flex-col h-full min-h-0">
            {roomNum !== "NaN" && roomNum !== "" ? (
               <div className="flex-1 min-h-0">
                  {charData.length > 0
                     ? (
                        <>
                           <StatusBar roomNum={roomNum} synced={synced} />
                           <HPListClickable charData={charData} onClick={(id: number) => router.push(`/${roomNum}/${id}`)} />
                        </>
                     ) : (
                        <p className="box-border text-g1 py-5 px-12 bg-g5 rounded-2xl">
                           <b className="block">Room empty.</b>
                           You&apos;re the first one here!
                        </p>
                     )}
                  <div className="text-center my-5">
                     <a href={`/${roomNum}/new-character`} className="text-blue hover:bg-blue hover:text-w px-2 rounded-lg transition-colors">
                        + New Character
                     </a>
                  </div>
               </div>
            ) : (
               <div className="flex-1 flex justify-center items-center">
                  <h1 className="text-g1 italic text-5xl">HPT2</h1>
               </div>
            )}
            <p className="text-g2 mb-5 italic">
               {roomNum === "NaN" ? "Welcome to HParty2! Type in a room number to join a game." : "Select a character to join the game, or click new character."}
            </p>
            <Field id="roomNum" label="Room number" type="number" value={roomNum} setValue={(n) => setRoomNum(n.toString())} />
         </div>
      </Screen >
   );
}
