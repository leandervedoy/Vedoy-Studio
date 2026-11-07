export const VEDOY_INTERNAL_ORG = "org_vedoy";

export function normalizePreviewEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || email.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
export function isVerifiedPreviewOwner(session) {
  return Boolean(session && session.role === "vedoy_owner" &&
    normalizePreviewEmail(session.email) === "leander@vedoy.store");
}
export function isInternalPreviewAdmin(session, members) {
  if (isVerifiedPreviewOwner(session)) return true;
  if (!session || session.organizationId !== VEDOY_INTERNAL_ORG ||
    !["owner", "admin"].includes(session.role)) return false;
  const email = normalizePreviewEmail(session.email);
  if (!email) return false;
  return Array.isArray(members) && members.some(member =>
    member.organizationId === VEDOY_INTERNAL_ORG &&
    normalizePreviewEmail(member.email) === email &&
    ["owner", "admin"].includes(member.role)
  );
}
export function canViewDraft({ visibility, isInternalAdmin, isGranted }) {
  return visibility === "draft" && Boolean(isInternalAdmin || isGranted);
}
