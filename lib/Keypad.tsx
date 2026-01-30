"use client"

import { useCallback, useEffect, createContext, ReactNode, useState, Dispatch, SetStateAction, useMemo } from "react";

function KeypadButton({ name, onClick, style }: { name: string, onClick: () => void, style: string | undefined }) {
   return (
      <button onClick={onClick} className={`${style ? style : "h-12 border-g3 hover:bg-g3"} border-2 w-full rounded-2xl transition-colors`}>
         {name}
      </button>
   )
}

export type keyPadLayout = { name: string | number, keyPress?: string | number, style?: string }[][];

interface buttonProps {
   children: ReactNode
}

type keypadInterface_T = { layout: keyPadLayout, onClick: (keyName: string) => void } | undefined;

export const KeypadContext = createContext<Dispatch<SetStateAction<keypadInterface_T>> | undefined>(undefined);

export default function Keypad({ children }: buttonProps) {

   const [pad, setPad] = useState<keypadInterface_T>();

   const handleKeyPress = useCallback((e: KeyboardEvent) => {
      const key = pad?.layout?.flat().find((i) => i?.keyPress?.toString() === e.key)
      if (key)
         pad?.onClick(key.name.toString());
   }, [pad])

   useEffect(() => {
      document.addEventListener('keydown', handleKeyPress)
      return () => {
         document.removeEventListener('keydown', handleKeyPress);
      }
   }, [handleKeyPress]);

   return (
      <KeypadContext value={setPad}>
         <div className="flex flex-col flex-1 min-h-0">
            {children}
            <div className="flex flex-col gap-1.5 mt-2">
               {pad?.layout?.map((row, i) => <div className="flex gap-1.5" key={i}>
                  {row.map(b => <KeypadButton name={b.name.toString()} key={b.name} onClick={() => pad?.onClick(b.name.toString())} style={b.style} />)}
               </div>)}
            </div>
         </div>
      </KeypadContext>
   )
}
