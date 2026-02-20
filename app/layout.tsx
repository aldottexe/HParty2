import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import PopupManager from "@/lib/PopupManager";
import Keypad from "@/lib/Keypad";
import Screen from "@/lib/Screen";
import { IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";

const ipm = IBM_Plex_Mono({ weight: ["100", "200", "300", "400", "500", "700"] });

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
      <html lang="en" className={ipm.className}>
         <body
            className={`antialiased max-w-150 mx-auto box-border p-0 m-0`}
         >
            <div className="h-screen flex flex-col mx-5 box-border pb-5 min-h-0">
               <Link href="/" className="pb-1 pt-2 px-4"><Image src="/HP2 logo2.svg" alt="logo" width={35} height={10} /></Link>
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
