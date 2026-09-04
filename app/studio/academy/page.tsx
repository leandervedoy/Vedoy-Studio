import { ModuleHeader } from "@/components/studio/module-header";
import { listAcademyCourses } from "@/lib/repository";

export default function AcademyPage() {
  const courses = listAcademyCourses();
  return <><ModuleHeader eyebrow="VOKS" title="Vedøy Academy" description="Korte, praktiske kurs som gjør det lettere å bruke teknologien du betaler for." badge="BETA" /><section className="academy-progress"><div><small>DIN FREMDRIFT</small><h2>Du bygger digital trygghet, litt etter litt.</h2><p>2 av 8 grunnkurs er påbegynt.</p></div><div className="academy-ring" style={{ "--progress": "28%" } as React.CSSProperties}><strong>28%</strong><span>fullført</span></div></section><div className="course-grid">{courses.map((course) => <article key={course.id}><div className="course-cover"><span>{course.category === "KI" ? "✦" : course.category === "Sikkerhet" ? "⌁" : course.category === "Analyse" ? "↗" : "▦"}</span><small>{course.category}</small></div><div className="course-body"><div><span>{course.level}</span><span>{course.minutes} min</span></div><h2>{course.title}</h2><p>{course.description}</p><div className="course-progress"><i><b style={{ width: `${course.progress}%` }} /></i><span>{course.progress}%</span></div><button className="button button--ghost button--wide">{course.progress > 0 ? "Fortsett kurset" : "Start kurset"}</button></div></article>)}</div></>;
}
