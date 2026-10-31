import PrintEditor from "../../components/print-editor";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Vedøy Print Engine – Design din gave", description: "Lag personlige plakater og last ned dine egne trykkfiler." };
export default function PrintPage() { return <PrintEditor />; }
