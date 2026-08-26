"use client";

import { NotesWorkspace } from "@vedoy/notes";
import type { StudioNote } from "@/lib/types";

export function NotesBoard({ initialNotes, compact = false }: { initialNotes: StudioNote[]; compact?: boolean }) {
  return <NotesWorkspace initialNotes={initialNotes} compact={compact} />;
}
