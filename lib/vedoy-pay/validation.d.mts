export declare const PAY_COLORS: readonly ["obsidian","fjord","pine","sand","plum","rose"];
export declare const PAY_PATTERNS: readonly ["solid","waves","grid","diagonal","orbit"];
export type PayCardDesign = { readonly color: string; readonly pattern: string; readonly label: string };
export declare function validatePayDesign(input: unknown): PayCardDesign;
export declare function payIdentityIsVerified(userId: unknown): boolean;
export declare function allowLinkedPartner(status: unknown, verifiedAt: unknown): boolean;
export declare const VEDOY_PAY_ACTIONS: Readonly<{issueCard: false;openBankAccount:false;transferCoins:false;chargeCustomer:false}>;
