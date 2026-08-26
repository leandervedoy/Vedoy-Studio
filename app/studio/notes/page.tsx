import { NotesBoard } from "@/components/studio/notes-board";
import { ModuleHeader } from "@/components/studio/module-header";
import { listStudioNotes } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  return <>
    <ModuleHeader eyebrow="DRIFT" title="Notater" description="Et rolig sted for idéer, kundepunkter og neste steg – lagret i Studio." badge="PRIVAT" />
    <NotesBoard initialNotes={await listStudioNotes()} />
  </>;
}
