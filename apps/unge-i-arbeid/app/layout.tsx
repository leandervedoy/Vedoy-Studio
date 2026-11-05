import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Unge i arbeid – Finn din neste mulighet | Vedøy",description:"Finn deltidsjobber, helgejobber og sommerjobber. Søk uten CV, og la bedrifter bli kjent med deg. En egen Vedøy-tjeneste i pilot.",robots:{index:false,follow:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#143b30"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nb"><body>{children}</body></html>}
