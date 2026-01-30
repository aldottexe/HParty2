"use client"
import { createContext, ReactNode, useState } from "react";
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
   enqueuePopup: (arg0: ReactNode, opts?: popupItemOptions) => () => void,
   blocking: boolean
}

export const PopupManagerContext = createContext<popupInterface | undefined>(undefined);

export default function PopupManager({ children }: { children: ReactNode }) {
   const [popups, setPopups] = useState<PopupItem[]>([]);

   function enqueuePopup(node: ReactNode, opts?: popupItemOptions) {
      const id = crypto.randomUUID();

      setPopups(p => [...p, { id: id, node: node, options: opts }]);

      return () => {
         setPopups(p => p.filter(x => x.id !== id))
      }
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
                  setPopups(p => p.splice(1))
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
