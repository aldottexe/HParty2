import { ReactNode } from "react";

type PopupProps = {
   children: ReactNode;
   onBackgroundClick?: () => void;
};

export default function Popup({ children, onBackgroundClick }: PopupProps) {
   return (
      <div
         className="absolute inset-0 flex justify-center items-center z-50 drop-shadow-[5px_5px_var(--color-g1)]"
         onClick={onBackgroundClick}
      >
         <div
            className="border-blue border-5 bg-w rounded-2xl p-3"
            onClick={(e) => e.stopPropagation()}
         >
            {children}
         </div>
      </div>
   );
}
