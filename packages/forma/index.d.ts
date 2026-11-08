/** Optional progressive enhancement for Vedoy Forma components. */
export const formaVersion: string;
export function initForma(root?: Document | HTMLElement): () => void;
declare const forma: { version: string; initForma: typeof initForma };
export default forma;
