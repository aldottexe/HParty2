interface lp {
   roomNum: string | number;
   charName?: string;
   synced?: boolean;
}

function Left({ roomNum, charName, synced }: lp) {
   return (
      <div>
         <p className="text-g1">Room_{roomNum}
            {charName && (
               <span className="text-blue">
                  /{charName}
               </span>
            )}
         </p>
         {synced && (
            <span className={`w-3  aspect-square rounded-full ${synced ? 'bg-green' : 'bg-red'} animate-pulse`}></span>
         )}
      </div>
   );
}

interface p {
   roomNum: string | number;
   charName?: string;
   synced?: boolean;
   onLeave?: () => void;
}

export default function StatusBar({ roomNum, charName, synced, onLeave }: p) {
   if (onLeave) return (
      <div className="flex justify-between items-center mb-5">
         <Left roomNum={roomNum} charName={charName} synced={synced} />
         <button className="px-2 rounded-lg bg-blue text-w hover:bg-dblue transition-colors" onClick={onLeave}>
            Leave
         </button>
      </div>
   );
   else return (
      <div className="flex justify-between items-center mb-5">
         <Left roomNum={roomNum} charName={charName} synced={synced} />
      </div>
   );
}
