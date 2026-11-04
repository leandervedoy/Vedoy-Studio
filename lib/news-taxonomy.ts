// Shared project and topic taxonomy for Vedoy News.
// Stored in the existing category column as "project:topic" to avoid a breaking DB migration.
// Legacy category strings remain readable as Vedoy-wide news.
export const NEWS_PROJECTS = [
  { slug: "vedoy", label: "Vedøy" },
  { slug: "studio", label: "Vedoy Studio" },
  { slug: "collective", label: "Vedoy Collective" },
  { slug: "assist", label: "Vedoy Assist" },
  { slug: "sent", label: "Sent" },
  { slug: "commerce", label: "Vedoy Commerce" },
  { slug: "spotlight", label: "Vedoy Spotlight" },
  { slug: "collabs", label: "Vedoy Collabs" },
  { slug: "phone", label: "Vedoy Phone" },
  { slug: "rewards", label: "Vedoy Rewards" },
  { slug: "earth", label: "Vedoy Earth" },
  { slug: "os", label: "Vedoy OS" }
] as const;

export const NEWS_TOPICS = [
  { slug: "nyheter", label: "Nyheter" },
  { slug: "utvikling", label: "Utvikling" },
  { slug: "lansering", label: "Lanseringer" },
  { slug: "guider", label: "Guider" },
  { slug: "bak-kulissene", label: "Bak kulissene" }
] as const;

export type NewsProjectSlug = typeof NEWS_PROJECTS[number]["slug"];
export type NewsTopicSlug = typeof NEWS_TOPICS[number]["slug"];

const legacyTopics: Record<string, NewsTopicSlug> = {
  "Announcements": "nyheter",
  "Projects": "utvikling",
  "Guides": "guider",
  "Behind Vedøy": "bak-kulissene"
};

export function hasNewsProject(value: string): value is NewsProjectSlug {
  return NEWS_PROJECTS.some((item) => item.slug === value);
}
export function hasNewsTopic(value: string): value is NewsTopicSlug {
  return NEWS_TOPICS.some((item) => item.slug === value);
}

export function encodeNewsCategory(project: string, topic: string): string {
  if (!hasNewsProject(project) || !hasNewsTopic(topic)) {
    throw new Error("Ugyldig prosjekt eller nyhetskategori.");
  }
  return project + ":" + topic;
}

export function decodeNewsCategory(value: string): {
  project: NewsProjectSlug;
  topic: NewsTopicSlug;
  projectLabel: string;
  topicLabel: string;
} {
  const [rawProject, rawTopic] = String(value || "").split(":");
  const project: NewsProjectSlug = hasNewsProject(rawProject) && hasNewsTopic(rawTopic) ? rawProject : "vedoy";
  const topic: NewsTopicSlug = hasNewsProject(rawProject) && hasNewsTopic(rawTopic)
    ? rawTopic
    : (legacyTopics[value] || "nyheter");
  return {
    project,
    topic,
    projectLabel: NEWS_PROJECTS.find((item) => item.slug === project)?.label || "Vedøy",
    topicLabel: NEWS_TOPICS.find((item) => item.slug === topic)?.label || "Nyheter"
  };
}

export function postMatchesNewsFilters(category: string, project?: string, topic?: string): boolean {
  const parsed = decodeNewsCategory(category);
  return (!project || parsed.project === project) && (!topic || parsed.topic === topic);
}
