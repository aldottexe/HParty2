import { Tables } from "@/database.types";
import { ReactNode } from "react";
export type char = {
   name: string | ReactNode
   current: number
   max: number
   temp: number
};

type p = {
   name: string | ReactNode
   current: number
   max: number
   temp: number
   companions?: char[]
}

function HPBarW(c: char) {
   return Math.round((c.current / Math.max(c.current + c.temp, c.max)) * 100)
}
function tempBarW(c: char) {
   return Math.round(((c.current + c.temp) / Math.max(c.current + c.temp, c.max)) * 100)
}

export default function HPBar({ name, current, max, temp, companions }: p) {
   const mainChar = { name: name, current: current, max: max, temp: temp };
   return (
      <div className="relative">
         <div className="flex justify-between text-g1">
            <span>{name}</span>
            <span>{current} / {max}{temp > 0 && ` ( +${temp} )`} </span>
         </div>
         <div className="w-full h-5 relative bg-g5 rounded-3xl">
            <div className="bg-g4 rounded-3xl h-5 absolute z-10 transition-all duration-500" style={{ width: `${HPBarW(mainChar)}%` }}>
            </div>
            <div className="rounded-3xl h-5 absolute transition-all duration-500" style={{ width: `${tempBarW(mainChar)}%`, background: "repeating-conic-gradient(transparent 0deg 90deg,var(--g4) 90deg 180deg)", backgroundSize: "5px 5px" }}>
            </div>
         </div>
         {companions?.map((c) => <CompanionHPBar key={c.name?.toString()} c={c} />)}
      </div>
   )
}

function CompanionHPBar({ c }: { c: char }) {
   return (
      <div className="w-full h-1.5 relative bg-lblue rounded-3xl mt-1.5">
         <div className="bg-blue rounded-3xl h-1.5 absolute z-10 transition-all duration-500" style={{ width: `${HPBarW(c)}%` }}>
         </div>
         <div className="rounded-3xl h-1.5 absolute transition-all duration-500" style={{ width: `${tempBarW(c)}%`, background: "repeating-conic-gradient(var(--lblue) 0deg 90deg,var(--blue) 90deg 180deg)", backgroundSize: "5px 5px" }}>
         </div>
      </div>
   );
}


interface CompanionSelectorProps {
   companionList: Tables<'Character'>[];
   onCharSelect: (id: number) => void;
   onCharSceen: () => void;
   onAddChar: () => void;
   selectedID: number;
}

function CompanionSelector({ selectedID, companionList, onCharSelect, onCharSceen, onAddChar }: CompanionSelectorProps) {
   if (companionList.length > 1)
      return (
         <div className="flex gap-2 items-center pb-1 relative top-1">
            <div className="flex gap-4 flex-1 justify-around overflow-x-scroll no-scrollbar pb-2">
               {companionList
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => {
                     if (selectedID == c.id) {
                        return (
                           <button key={c.name} className="text-blue transition-colors min-w-max">{c.name}</button>
                        )
                     } else {
                        return (
                           <button key={c.name} onClick={() => onCharSelect(c.id)} className="block text-g4 transition-colors relative min-w-max">
                              {c.name}
                              <div className="absolute bg-lblue left-0 right-0 w-full rounded-3xl">
                                 <div className="rounded-3xl h-1.5 transition-all duration-500 bg-blue"
                                    style={{ width: `${tempBarW({ name: c.name, current: c.current_hp, max: c.max_hp, temp: c.temp_hp })}%` }}
                                 >
                                 </div>
                              </div>
                           </button>
                        )
                     }
                  })}
            </div>
            <button className="bg-blue px-3 rounded-lg hover:bg-dblue transition-colors text-w mb-2" onClick={onCharSceen}>more</button>
         </div>
      )
   else
      return (
         <div className="flex gap-2 items-center justify-center">
            <button onClick={onAddChar} className="text-blue hover:bg-blue hover:text-w px-2 rounded-lg transition-colors">
               + Add Companion
            </button>
         </div>
      )
}

interface playerBarProps {
   selectedID: number;
   charList: Tables<'Character'>[];
   onCharSelect: (id: number) => void;
   onCharScreen: () => void;
   onAddChar: () => void;
}

export function PlayerBar({ selectedID, charList, onCharSelect, onCharScreen, onAddChar }: playerBarProps) {
   const selectedChar = charList.find(c => c.id == selectedID);

   const selectedCharInfoAsChar: char | undefined = selectedChar ? {
      name: selectedChar.name,
      current: selectedChar.current_hp,
      max: selectedChar.max_hp,
      temp: selectedChar.temp_hp
   } : undefined;

   return selectedCharInfoAsChar ? (
      <div>
         <div className="flex justify-between mb-1">
            <h2 className="text-g1 font-bold text-2xl">{selectedChar?.name ?? "character"}</h2>
            <p className="text-2xl text-g1">
               {selectedChar?.current_hp} / {selectedChar?.max_hp}{(selectedChar?.temp_hp ?? 0) > 0 && ` (+${selectedChar?.temp_hp})`}
            </p>
         </div>
         <div className="bg-g5 h-9 rounded-xl relative mb-2">
            <div className="rounded-xl h-9 bg z-10 bg-g4 absolute transition-all duration-500"
               style={{ width: `${HPBarW(selectedCharInfoAsChar)}%` }}>
            </div>
            <div className="rounded-xl h-9 bg z-10 absolute transition-all duration-500"
               style={{
                  width: `${tempBarW(selectedCharInfoAsChar)}%`,
                  background: "repeating-conic-gradient(transparent 0deg 90deg,var(--g4) 90deg 180deg)",
                  backgroundSize: "5px 5px"
               }}>
            </div>
         </div>
         <CompanionSelector selectedID={selectedID} companionList={charList} onCharSelect={onCharSelect} onCharSceen={onCharScreen} onAddChar={onAddChar} />
      </div>
   ) : (
      <div>
         <h2>loading...</h2>
      </div>
   )
}
