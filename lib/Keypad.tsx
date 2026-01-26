"use client"

import { useCallback, useEffect, createContext } from "react";

function KeypadButton({ name, onClick, style }: { name: string, onClick: () => void, style: string | undefined }) {
   return (
      <button onClick={onClick} className={`${style ? style : "h-12 border-g3 hover:bg-g3"} border-2 w-full rounded-2xl transition-colors`}>
         {name}
      </button>
   )
}

export type keyPadLayout = { name: string | number, keyPress?: string | number, style?: string }[][];

interface buttonProps {
   layout: keyPadLayout;
   onClick: (arg0: string) => void;
}

export const KeypadContext = createContext<keyPadLayout | undefined>(undefined);

export default function Keypad({ layout, onClick }: buttonProps) {

   const handleKeyPress = useCallback((e: KeyboardEvent) => {
      const key = layout.flat().find((i) => i?.keyPress?.toString() === e.key)
      if (key)
         onClick(key.name.toString());
   }, [onClick, layout])

   useEffect(() => {
      document.addEventListener('keydown', handleKeyPress)
      return () => {
         document.removeEventListener('keydown', handleKeyPress);
      }
   }, [handleKeyPress]);

   return (
      <div className="flex flex-col gap-1.5 mt-2">
         {layout.map((row, i) => <div className="flex gap-1.5" key={i}>
            {row.map(b => <KeypadButton name={b.name.toString()} key={b.name} onClick={() => onClick(b.name.toString())} style={b.style} />)}
         </div>)}
      </div>
   )
}
