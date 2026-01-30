import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import PopupManager from "@/lib/PopupManager";
import Keypad from "@/lib/Keypad";
import Screen from "@/lib/Screen";

export const metadata: Metadata = {
   title: "HParty2!",
   description: "track your health and such",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`antialiased max-w-150 mx-auto box-border p-0 m-0`}
         >
            <div className="h-screen flex flex-col mx-5 box-border pb-5 min-h-0">
               <Link href="/" className="px-5 py-1 block font-bold italic text-sm">HParty2</Link>
               <Keypad>
                  <Screen>
                     <PopupManager>
                        {children}
                     </PopupManager>
                  </Screen>
               </Keypad>
            </div>
         </body>
      </html >
   );
}
