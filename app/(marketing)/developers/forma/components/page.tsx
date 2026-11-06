import type {Metadata} from "next";
import {FormaGallery} from "@/components/forma/forma-gallery";
export const metadata:Metadata={
 title:"50 UI-komponenter og menybygger – Vedoy Forma",
 description:"Test responsive Vedoy Forma-komponenter, søk gjennom 50 UI-mønstre og lag din egen meny med levende kode.",
 alternates:{canonical:"/developers/forma/components"}
};
export default function FormaComponentsPage(){return <FormaGallery/>}
