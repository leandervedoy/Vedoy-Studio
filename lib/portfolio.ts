import { privilegedSupabase } from "@/lib/vedoy-manager";

export type PortfolioStage = "idea" | "building" | "testing" | "ready" | "launched" | "paused";
export type PortfolioSource = "manual" | "github" | "gitea" | "upload" | "git-url";
export type PortfolioHealth = "unknown" | "success" | "failure" | "pending";
export type PortfolioGoal = "soon" | "short" | "long" | "balanced";
export type PortfolioMode = "auto" | "manual";

export const CHECKLIST = [
  { key: "scope", label: "Omfang og funksjoner bestemt", weight: 10 },
  { key: "core", label: "Hovedfunksjonalitet fungerer", weight: 30 },
  { key: "tests", label: "Viktige tester gjennomført", weight: 20 },
  { key: "billing", label: "Betaling og forretningsmodell avklart", weight: 15 },
  { key: "security", label: "Sikkerhet og personvern vurdert", weight: 15 },
  { key: "release", label: "Produksjon og lansering kontrollert", weight: 10 }
] as const;

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  source: PortfolioSource;
  repoFullName: string | null;
  repoUrl: string | null;
  repoDefaultBranch: string | null;
  parentId: string | null;
  progress: number;
  progressConfirmed: boolean;
  checklist: Record<string, boolean>;
  effectiveProgress: number;
  stage: PortfolioStage;
  shortValue: number;
  longValue: number;
  remainingHours: number;
  manualPriority: number;
  nextAction: string;
  launchUrl: string | null;
  repoHealth: PortfolioHealth;
  repoLastPush: string | null;
  checkedAt: string | null;
  hasArchive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPreferences {
  goal: PortfolioGoal;
  mode: PortfolioMode;
}

type ProjectRow = {
  id: string; name: string; description: string; source: PortfolioSource;
  repo_full_name: string | null; repo_url: string | null; repo_default_branch: string | null;
  parent_id: string | null; progress: number; progress_confirmed: boolean;
  checklist: Record<string, boolean> | null; stage: PortfolioStage;
  short_value: number; long_value: number; remaining_hours: number; manual_priority: number;
  next_action: string; launch_url: string | null; repo_health: PortfolioHealth;
  repo_last_push: string | null; checked_at: string | null; archive_path: string | null;
  created_at: string; updated_at: string;
};

export function computeProgress(project: Pick<PortfolioProject, "progress" | "progressConfirmed" | "checklist">): number {
  if (project.progressConfirmed) return Math.max(0, Math.min(100, project.progress));
  return CHECKLIST.reduce((sum, step) => sum + (project.checklist?.[step.key] ? step.weight : 0), 0);
}

export function mapPortfolio(row: ProjectRow): PortfolioProject {
  const item: PortfolioProject = {
    id: row.id, name: row.name, description: row.description, source: row.source,
    repoFullName: row.repo_full_name, repoUrl: row.repo_url, repoDefaultBranch: row.repo_default_branch,
    parentId: row.parent_id, progress: row.progress, progressConfirmed: row.progress_confirmed,
    checklist: row.checklist || {}, effectiveProgress: 0, stage: row.stage,
    shortValue: row.short_value, longValue: row.long_value, remainingHours: row.remaining_hours,
    manualPriority: row.manual_priority, nextAction: row.next_action, launchUrl: row.launch_url,
    repoHealth: row.repo_health, repoLastPush: row.repo_last_push, checkedAt: row.checked_at,
    hasArchive: Boolean(row.archive_path), createdAt: row.created_at, updatedAt: row.updated_at
  };
  item.effectiveProgress = computeProgress(item);
  return item;
}

export async function listPortfolio(organizationId: string): Promise<PortfolioProject[]> {
  const { data, error } = await privilegedSupabase()
    .from("growth_portfolio_projects").select("*").eq("organization_id", organizationId)
    .order("updated_at", { ascending: false }).limit(500);
  if (error) throw error;
  return ((data || []) as ProjectRow[]).map(mapPortfolio);
}

export async function portfolioPreferences(organizationId: string): Promise<PortfolioPreferences> {
  const { data, error } = await privilegedSupabase()
    .from("growth_portfolio_preferences").select("goal,mode").eq("organization_id", organizationId).maybeSingle();
  if (error) throw error;
  return { goal: (data?.goal || "soon") as PortfolioGoal, mode: (data?.mode || "auto") as PortfolioMode };
}

export function priorityScore(project: PortfolioProject, preferences: PortfolioPreferences): number {
  if (preferences.mode === "manual") return project.manualPriority * 100 + project.effectiveProgress / 10;
  const p = project.effectiveProgress, h = project.remainingHours;
  const short = project.shortValue * 20, long = project.longValue * 20;
  if (preferences.goal === "soon") return (project.stage === "launched" ? -1000 : 0) + p * 1.5 - h * .6;
  if (preferences.goal === "short") return short * 1.3 + p * .45 - h * 1.5;
  if (preferences.goal === "long") return long * 1.5 + p * .2 - h * .2;
  return (short + long) * .6 + p * .5 - h * .8;
}

export function sortPortfolio(projects: PortfolioProject[], preferences: PortfolioPreferences): PortfolioProject[] {
  return [...projects].sort((a, b) =>
    priorityScore(b, preferences) - priorityScore(a, preferences)
    || b.effectiveProgress - a.effectiveProgress
    || a.name.localeCompare(b.name, "nb")
  );
}

export function userCanEditPortfolio(role: string): boolean {
  return role === "vedoy_owner" || role === "owner" || role === "admin";
}

export function validRepositoryName(value: string): boolean {
  return /^[A-Za-z0-9_.-]{1,100}[/][A-Za-z0-9_.-]{1,100}$/.test(value) && !value.includes("..");
}

export async function getPortfolioRow(organizationId: string, id: string) {
  const { data, error } = await privilegedSupabase()
    .from("growth_portfolio_projects").select("*").eq("organization_id", organizationId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ProjectRow | null;
}

export const PORTFOLIO_BUCKET = "vedoy-portfolio-projects";
