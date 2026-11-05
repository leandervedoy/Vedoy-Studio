import type {Metadata,Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={
 title:"Vedoy Deliver – lokal levering og budportal",
 description:"Vedoy Deliver er en pilot for lokale leveringer på Haugalandet. Utforsk muligheter for bedrifter og søk om å bli bud.",
 applicationName:"Vedoy Deliver",
 manifest:"/manifest.webmanifest",
 icons:{icon:[{url:"/vedoy-deliver-icon.png",sizes:"384x384",type:"image/png"}],shortcut:"/vedoy-deliver-icon.png",apple:"/vedoy-deliver-icon.png"},
 metadataBase:new URL("https://vedoy-deliver.vercel.app"),
 alternates:{canonical:"/"},
 openGraph:{title:"Vedoy Deliver – lokal levering",description:"Utforsk Vedoy Delivers lokale leveringspilot for bedrifter og bud.",url:"https://vedoy-deliver.vercel.app",type:"website",locale:"nb_NO"},
 robots:{index:true,follow:true}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#12382f"};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="nb"><body>{children}</body></html>;
}
