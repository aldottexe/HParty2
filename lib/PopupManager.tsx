"use client"

// POPUP MANAGER.tsx
import { createContext, ReactNode, useEffect, useState } from "react";
import Popup from "./Popup";


type popupItemOptions = {
   blocking?: boolean,
   exitOnBackgroundClick?: boolean,
}
type PopupItem = {
   id: string
   node: React.ReactNode
   options?: popupItemOptions
}

interface popupInterface {
   enqueuePopup: (arg0: ReactNode | ((close: () => void) => ReactNode), opts?: popupItemOptions) => () => void,
   blocking: boolean
}

export const PopupManagerContext = createContext<popupInterface | undefined>(undefined);

export default function PopupManager({ children }: { children: ReactNode }) {
   const [popups, setPopups] = useState<PopupItem[]>([]);

   function enqueuePopup(node: ReactNode | ((close: () => void) => ReactNode), opts?: popupItemOptions) {
      const id = crypto.randomUUID();
      const close = () => {
         setPopups(p => p.filter(x => x.id !== id));
      }

      const resolvedNode = typeof node === "function" ? node(close) : node;

      setPopups(p => [...p, { id: id, node: resolvedNode, options: opts }]);
      return close;
   }

   const pi: popupInterface = {
      enqueuePopup,
      blocking: popups[0]?.options?.blocking ?? false
   }
   return (
      <PopupManagerContext value={pi}>

         {popups[0] ?
            popups[0].options?.exitOnBackgroundClick ? (
               <Popup onBackgroundClick={() =>
                  setPopups(p => p.slice(1))
               }>
                  {popups[0].node}
               </Popup>
            ) : (
               <Popup>
                  {popups[0].node}
               </Popup>
            ) : (
               <></>
            )
         }

         {children}
      </PopupManagerContext>
   )

}
