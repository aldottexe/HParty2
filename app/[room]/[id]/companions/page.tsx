"use client"

import { Tables } from "@/database.types";
import { HPListClickable } from "@/lib/HPList";
import { KeypadContext, keyPadLayout } from "@/lib/Keypad";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useContext, useEffect, useState } from "react";

interface p {
   params: Promise<{
      room: string;
      id: string;
   }>
}

const keyLayout: keyPadLayout = [[
   { name: "BACK", style: "h-8 border-g3 bg-g2" },
   { name: "ADD NEW", style: "h-8 border-dblue bg-blue" },
]]

export default function Companions({ params }: p) {
   const { room, id } = use(params);
   const router = useRouter();

   const [companions, setCompanions] = useState<Tables<'Character'>[]>([]);

   const searchParams = useSearchParams();
   const cameFromResources = searchParams.get("from-resources") === "true";

   const handleClick = useCallback((val: string) => {
      switch (val) {
         case "BACK":
            router.push('/');
            break;
         case "ADD NEW":
            router.push(`/${room}/${id}/new-companion`);
            break;
      }
   }, [router, id, room]);

   const setKeys = useContext(KeypadContext);
   useEffect(() => {
      if (setKeys)
         setKeys({
            layout: keyLayout,
            onClick: handleClick,
         })
   }, [handleClick, setKeys]);


   useEffect(() => {
      const c = supabase.from('Character').select().or(`id.eq.${parseInt(id)},parent.eq.${parseInt(id)}`).then(({ data, error }) => {
         if (error) {
            console.error(error);
            router.push('/');
            return;
         }
         data?.forEach(d => { d.parent = null });
         setCompanions(data);
      })
   }, [id, router]);

   return (
      <div className="flex justify-center flex-col flex-1 h-full">
         <div className="flex border-b-2 border-b-g1 justify-between mb-3">
            <h1 className="text-2xl text-g1 font-bold">
               Companions
            </h1>
            <p className="text-2xl text-g1">
               {companions.length || ""}
            </p>
         </div>
         <HPListClickable
            charData={companions}
            onClick={(i) => router.push(`/${room}/${id}${cameFromResources && "/resources"}?companion=${i}`)}
            mainCharID={parseInt(id)}
         />
      </div>
   );
}
