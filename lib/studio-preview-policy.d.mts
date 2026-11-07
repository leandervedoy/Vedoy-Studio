import type { SessionPayload, TeamMember } from "@/lib/types";
export declare const VEDOY_INTERNAL_ORG: "org_vedoy";
export declare function normalizePreviewEmail(value: unknown): string | null;
export declare function isVerifiedPreviewOwner(session: SessionPayload | null | undefined): boolean;
export declare function isInternalPreviewAdmin(session: SessionPayload | null | undefined, members: readonly TeamMember[]): boolean;
export declare function canViewDraft(args: { visibility: string; isInternalAdmin: boolean; isGranted: boolean }): boolean;
