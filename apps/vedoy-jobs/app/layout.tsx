import type { Metadata, Viewport } from "next";
import "./market.css";
export const metadata: Metadata={title:"Vedoy Marked – Finn noe fint. Gi noe nytt liv.",description:"En ny norsk markedsplass for bruktfunn, kjøretøy, bolig, tjenester og fleksible oppdrag. Vedoy Marked er under utvikling.",robots:{index:false,follow:false}};
export const viewport: Viewport={width:"device-width",initialScale:1,themeColor:"#153d30"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nb"><body>{children}</body></html>}
