import { ModuleHeader } from "@/components/studio/module-header";
import { AcademyLab } from "@/components/studio/academy-lab";
import { listAcademyCourses } from "@/lib/repository";

export default function AcademyPage() {
  const courses = listAcademyCourses();
  return <><ModuleHeader eyebrow="VOKS" title="Vedøy Academy" description="Lær teori og øv samtidig i en trygg virtuell PC eller telefon." badge="BETA" /><section className="academy-progress"><div><small>DIN FREMDRIFT</small><h2>Digital trygghet, litt etter litt.</h2><p>{courses.length} kurs med teori, øving og praktiske oppgaver.</p></div><div className="academy-ring" style={{ "--progress": "0%" } as React.CSSProperties}><strong>0%</strong><span>start her</span></div></section><AcademyLab courses={courses} /></>;
}
