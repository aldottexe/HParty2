import { Tables } from "@/database.types";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useLiveCharData(roomNum: number) {
   const [charData, setCharData] = useState<Tables<"Character">[]>([]);
   const [synced, setSynced] = useState(false);

   const fetchData = useCallback(async () => {
      setSynced(false);

      const { data, error } = await supabase
         .from("Character")
         .select()
         .eq("room", roomNum);

      if (error) {
         console.error(error);
         return;
      }

      setCharData(data ?? []);
      setSynced(true);
   }, [roomNum]);

   useEffect(() => {
      if (!roomNum) return;

      // defer initial fetch (Strict Mode safe)
      const id = requestAnimationFrame(fetchData);

      const channel = supabase
         .channel(`character-room-${roomNum}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Character" },
            fetchData
         )
         .subscribe();

      const handleVisibility = () => {
         if (document.visibilityState === "hidden") {
            setSynced(false);
         } else {
            fetchData();
         }
      };

      const handleOffline = () => {
         setSynced(false);
      };

      window.addEventListener("offline", handleOffline);
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
         cancelAnimationFrame(id);
         window.removeEventListener("offline", handleOffline);
         document.removeEventListener("visibilitychange", handleVisibility);
         supabase.removeChannel(channel);
      };
   }, [roomNum, fetchData]);

   return { charData, synced };
}

export function useLiveResourceData(id: number) {
   const [resData, setResData] = useState<Tables<"Resource">[]>([]);
   const [synced, setSynced] = useState(false);

   const fetchData = useCallback(async () => {
      setSynced(false);

      const { data, error } = await supabase
         .from("Resource")
         .select()
         .eq("parent", id);

      if (error) {
         console.error(error);
         return;
      }

      setResData(data ?? []);
      setSynced(true);
   }, [id]);

   useEffect(() => {
      if (!id) return;

      // defer initial fetch (Strict Mode safe)
      const fetchId = requestAnimationFrame(fetchData);

      const channel = supabase
         .channel(`res-id-${id}`)
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "Resource" },
            fetchData
         )
         .subscribe();

      const handleVisibility = () => {
         if (document.visibilityState === "hidden") {
            setSynced(false);
         } else {
            fetchData();
         }
      };

      const handleOffline = () => {
         setSynced(false);
      };

      window.addEventListener("offline", handleOffline);
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
         cancelAnimationFrame(fetchId);
         window.removeEventListener("offline", handleOffline);
         document.removeEventListener("visibilitychange", handleVisibility);
         supabase.removeChannel(channel);
      };
   }, [id, fetchData]);

   return { resData, synced };

}
