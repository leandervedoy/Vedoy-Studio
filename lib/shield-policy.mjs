// Moderation only for public, user-submitted content. Never inspect end-to-end encrypted chats.
export function normalizeModerationText(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("nb-NO")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}
export function evaluatePublicMessage(body, activePhrases = []) {
  const normalized = " " + normalizeModerationText(body) + " ";
  for (const phrase of activePhrases) {
    const term = normalizeModerationText(phrase);
    if (term && normalized.includes(" " + term + " ")) {
      return { flagged: true, reason: "Krenkende ord eller uttrykk: " + term };
    }
  }
  const links = (String(body || "").match(/https?:\/\/|www\./gi) || []).length;
  if (links > 1) return { flagged: true, reason: "Mulig lenkespam" };
  if (/(.)\1{14,}/u.test(String(body || ""))) return { flagged: true, reason: "Mulig repetisjonsspam" };
  return { flagged: false, reason: null };
}
