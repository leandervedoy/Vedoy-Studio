// Stable keys let the original Norwegian copy remain readable in JSX and CMS data.
export function copyKey(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `c${(hash >>> 0).toString(36)}`;
}
