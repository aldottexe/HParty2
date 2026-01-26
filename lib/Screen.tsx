import { ReactNode } from "react";

export default function Screen({ children }: { children: ReactNode }) {
   return (
      <div className="bg-w rounded-2xl w-full flex-1 box-border p-5 pb-2 relative min-h-0 text-g1">
         {children}
      </div>
   );
}
