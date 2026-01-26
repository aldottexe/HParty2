import { use } from "react";

interface p {
   params: Promise<{
      room: string;
      id: string;
      res: string;
   }>
}
export default function EditResource({ params }: p) {
   const { room, id, res } = use(params);
}
