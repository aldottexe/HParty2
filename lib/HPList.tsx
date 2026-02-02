import { Tables } from "@/database.types";
import HPBar from "./HPBar";
import type { char } from "./HPBar";

function derivePlayerChars(charData: Tables<'Character'>[]): Tables<'Character'>[] {
   return charData.filter((c) => c.parent == null);
}
function deriveCompanionCharsByParent(charData: Tables<'Character'>[]): { [key: number]: char[] } {
   const npcs: { [key: number]: char[] } = {};
   charData.forEach((c) => {
      if (c.parent) {
         if (!npcs[c.parent]) {
            npcs[c.parent] = []
         };
         npcs[c.parent].push({
            name: c.name,
            current: c.current_hp,
            max: c.max_hp,
            temp: c.temp_hp,
         });
      }
   });
   return npcs;
}

export default function HPList({ charData }: { charData: Tables<'Character'>[] }) {
   const playerChars = derivePlayerChars(charData);
   const npcs = deriveCompanionCharsByParent(charData);

   return (
      <div className="flex flex-col gap-3">
         {playerChars.map((c) =>
            <HPBar
               key={c.id}
               name={c.name}
               current={c.current_hp}
               max={c.max_hp}
               temp={c.temp_hp}
               companions={npcs[c.id]}
            />
         )}
      </div>
   )
}

interface hlcp {
   charData: Tables<'Character'>[],
   onClick: (id: number) => void,
   mainCharID?: number
}
export function HPListClickable({ charData, onClick, mainCharID }: hlcp) {
   const playerChars = derivePlayerChars(charData);
   const npcs = deriveCompanionCharsByParent(charData);

   return (
      <div className="flex flex-col gap-3">
         {playerChars
            .sort((a, b) => {
               if (a.id == mainCharID) return -1;
               if (b.id == mainCharID) return 1;
               return a.name.localeCompare(b.name)
            })
            .map((c) =>
               <button onClick={() => onClick(c.id)}
                  key={c.id}
                  className="
               relative rounded-xl p-1
               before:absolute before:inset-0 before:rounded-xl
               before:bg-[repeating-conic-gradient(transparent_0deg_90deg,var(--g5)_90deg_180deg)]
               before:bg-[length:5px_5px] before:bg-repeat
               before:opacity-0 hover:before:opacity-100
               before:transition-opacity
               "
               >
                  <HPBar
                     name={c.name}
                     current={c.current_hp}
                     max={c.max_hp}
                     temp={c.temp_hp}
                     companions={npcs[c.id]}
                     emphasize={c.id == mainCharID}
                  />
               </button>
            )}
      </div>
   )
}

export function ResListClickable({ resData, onClick }: { resData: Tables<'Resource'>[], onClick: (id: number) => void }) {
   resData = resData.sort((a, b) => a.name > b.name ? 1 : -1);
   return (
      <div className="flex flex-col gap-3">
         {resData.map((r) =>
            <button onClick={() => onClick(r.id)}
               key={r.id}
               className="
               relative rounded-xl p-1
               before:absolute before:inset-0 before:rounded-xl
               before:bg-[repeating-conic-gradient(transparent_0deg_90deg,var(--g5)_90deg_180deg)]
               before:bg-[length:5px_5px] before:bg-repeat
               before:opacity-0 hover:before:opacity-100
               before:transition-opacity
               "
            >
               <HPBar
                  name={r.name}
                  current={r.current}
                  max={r.max}
                  temp={0}
               />
            </button>
         )}
      </div>
   )

}
