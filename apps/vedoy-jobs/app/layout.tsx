import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Vedoy Jobs – Tjen penger på din tid",description:"Finn fleksible oppdrag innen skriving, digitale tjenester, kundearbeid og lokal levering. Vedoy Jobs er under utvikling.",robots:{index:false,follow:false}};
export const viewport: Viewport = {width:"device-width",initialScale:1,themeColor:"#11271e"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nb"><body>{children}</body></html>}
