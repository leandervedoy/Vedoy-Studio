export declare class SandboxError extends Error { constructor(message:string) }
export type SandboxDesign = {color:string;pattern:string;label:string};
export type SandboxCard = {
  id:string;type:"virtual"|"physical";status:"active"|"not_shipped";displaySuffix:string;design:SandboxDesign;
};
export type SandboxEvent = {
  id:string;label:string;amountOre?:number;coins?:number;status?:string;cardId?:string;
};
export type SandboxState = {
  kind:"vedoy-pay-local-sandbox";version:1;accountOpened:boolean;balanceOre:number;coins:number;
  recipientCoins:number;cards:SandboxCard[];events:SandboxEvent[];usedKeys:string[];
  pending3ds:{amountOre:number;cardId:string}|null;revision:number;
};
export type SandboxAction =
  | {type:"OPEN_ACCOUNT";idempotencyKey:string}
  | {type:"FUND_WALLET";idempotencyKey:string;amountOre:number}
  | {type:"ADD_COINS";idempotencyKey:string;amount:number}
  | {type:"ISSUE_CARD";idempotencyKey:string;cardType:"virtual"|"physical";design:SandboxDesign}
  | {type:"PAY";idempotencyKey:string;cardId:string;amountOre:number;scenario:"approved"|"declined"|"3ds"}
  | {type:"COMPLETE_3DS";idempotencyKey:string;approved:boolean}
  | {type:"SEND_COINS";idempotencyKey:string;amount:number}
  | {type:"RESET"};
export declare function newSandbox():SandboxState;
export declare function isSandboxState(input:unknown):input is SandboxState;
export declare function applySandboxAction(state:SandboxState,action:SandboxAction):SandboxState;
