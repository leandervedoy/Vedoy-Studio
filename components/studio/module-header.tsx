import Link from "next/link";

export function ModuleHeader({
  eyebrow,
  title,
  description,
  badge,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="module-header">
      <div>
        <div className="module-header__eyebrow"><span>{eyebrow}</span>{badge && <b>{badge}</b>}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <Link className="button button--dark" href={action.href}>{action.label}</Link>}
    </header>
  );
}
