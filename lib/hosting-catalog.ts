export const ramOptions = [
  { value: 4, label: "4 GB", monthlyNok: 449, serverType: "cx23", use: "Nettside og små tjenester" },
  { value: 8, label: "8 GB", monthlyNok: 749, serverType: "cx33", use: "Nettbutikk og flere apper" },
  { value: 16, label: "16 GB", monthlyNok: 1190, serverType: "cx43", use: "Tyngre apper og databaser" },
  { value: 32, label: "32 GB", monthlyNok: 2190, serverType: "cx53", use: "Høy trafikk og arbeidslaster" }
] as const;

export const storageOptions = [
  { value: 80, label: "80 GB", monthlyNok: 0 },
  { value: 160, label: "160 GB", monthlyNok: 149 },
  { value: 320, label: "320 GB", monthlyNok: 349 },
  { value: 640, label: "640 GB", monthlyNok: 699 }
] as const;

export const regionOptions = [
  { value: "nbg1", label: "Tyskland", detail: "Nürnberg · EU" },
  { value: "hel1", label: "Finland", detail: "Helsinki · Norden" }
] as const;

export type DomainMode = "new" | "existing" | "none";

export type HostingSelection = {
  serverCount: number;
  ramGb: number;
  storageGb: number;
  region: string;
  backups: boolean;
  domainMode: DomainMode;
  domain?: string;
};

export type HostingPrice = {
  monthlyNok: number;
  setupNok: number;
  perServerNok: number;
};

export function normalizeHostingSelection(input: Partial<HostingSelection>): HostingSelection {
  const serverCount = Number(input.serverCount);
  const ramGb = Number(input.ramGb);
  const storageGb = Number(input.storageGb);
  const domainMode = input.domainMode;

  if (!Number.isInteger(serverCount) || serverCount < 1 || serverCount > 5) throw new Error("Velg mellom 1 og 5 servere.");
  if (!ramOptions.some((option) => option.value === ramGb)) throw new Error("Ugyldig RAM-valg.");
  if (!storageOptions.some((option) => option.value === storageGb)) throw new Error("Ugyldig lagringsvalg.");
  if (!regionOptions.some((option) => option.value === input.region)) throw new Error("Ugyldig serverregion.");
  if (domainMode !== "new" && domainMode !== "existing" && domainMode !== "none") throw new Error("Ugyldig domenevalg.");

  const domain = input.domain?.trim().toLowerCase();
  if (domainMode !== "none" && (!domain || !/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain))) {
    throw new Error("Skriv inn et gyldig domenenavn.");
  }

  return { serverCount, ramGb, storageGb, region: input.region!, backups: Boolean(input.backups), domainMode, domain };
}

export function calculateHostingPrice(selection: HostingSelection): HostingPrice {
  const ram = ramOptions.find((option) => option.value === selection.ramGb)!;
  const storage = storageOptions.find((option) => option.value === selection.storageGb)!;
  const backupNok = selection.backups ? 149 : 0;
  const perServerNok = ram.monthlyNok + storage.monthlyNok + backupNok;
  return {
    perServerNok,
    monthlyNok: perServerNok * selection.serverCount,
    setupNok: 990 + Math.max(0, selection.serverCount - 1) * 250
  };
}

export function getServerType(ramGb: number) {
  return ramOptions.find((option) => option.value === ramGb)?.serverType;
}
