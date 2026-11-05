import type {Metadata,Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={
 title:"Vedoy Deliver – Oppdrag som passer deg",
 description:"Søk som bud hos Vedoy Deliver, finn lokale leveringer og få oversikt over godtgjørelse per gjennomført oppdrag. Under utvikling.",
 robots:{index:false,follow:false}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#12382f"};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="nb"><body>{children}</body></html>;
}
