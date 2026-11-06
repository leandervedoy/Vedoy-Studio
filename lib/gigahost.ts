import "server-only";

const BASE = "https://api.gigahost.no/api/v0";
const COST_LIMIT_NOK = 2000;

type ApiResponse<T> = { meta?: { status?: number; message?: string }; data?: T };
type RawSpecs = {
  cpu_cores?: number;
  cpu_model?: string | null;
  ram_gb?: number;
  disks?: { size_gb?: number; type?: string }[];
  bw?: number;
  bw_type?: string;
};
type RawProduct = {
  product_id?: number | string;
  price_id?: number | string;
  product_name?: string;
  type?: string;
  in_stock?: boolean;
  built_to_order?: boolean;
  allow_recurring?: boolean;
  contract?: number | string;
  setup?: number | string;
  monthly_extra?: number | string;
  rate_monthly?: number | string;
  region_ids?: (number | string)[];
  specs?: RawSpecs;
  vm_cores?: number | string;
  vm_memory?: number | string;
  vm_storage?: number | string;
};
type RawCatalog = {
  tiers?: { products?: RawProduct[] }[];
  regions?: { region_id?: number | string; region_name?: string }[];
  currency?: string;
};

export type ServerOffer = {
  productId: number;
  priceId: number;
  name: string;
  type: "vm" | "dedicated";
  cores: number;
  cpuModel: string | null;
  ramGb: number;
  storageGb: number;
  regionIds: number[];
  monthlyNok: number;
  setupNok: number;
  backupsAvailable: boolean;
  canCheckout: boolean;
};

export type InternalOffer = ServerOffer & {
  supplierMonthlyNok: number;
  supplierSetupNok: number;
};

function number(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function priceMarkup(): number {
  const value = process.env.GIGAHOST_MARKUP_PERCENT || "40";
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 200) {
    throw new Error("Ugyldig GIGAHOST_MARKUP_PERCENT.");
  }
  return n;
}

function markedUp(nok: number): number {
  return Math.ceil(nok * (1 + priceMarkup() / 100));
}

export function gigahostCheckoutReady(): boolean {
  return process.env.GIGAHOST_CHECKOUT_ENABLED === "true" &&
    process.env.GIGAHOST_AUTO_PROVISION_ENABLED === "true" &&
    Boolean(process.env.GIGAHOST_API_KEY && process.env.GIGAHOST_DEFAULT_OS_ID &&
      process.env.DATABASE_URL && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

async function requestGigahost<T>(path: string, options?: { body: Record<string, unknown> }): Promise<T> {
  const key = process.env.GIGAHOST_API_KEY;
  if (!key || !key.startsWith("flux_live_")) {
    throw new Error("Gigahost API-nøkkel er ikke konfigurert.");
  }
  const response = await fetch(BASE + path, {
    method: options ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + key,
      ...(options ? { "Content-Type": "application/json" } : {})
    },
    body: options ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error("Gigahost kunne ikke utføre forespørselen (" + response.status + ").");
  const result = await response.json() as ApiResponse<T>;
  if (result.meta?.status && result.meta.status >= 400 || result.data === undefined) {
    throw new Error("Gigahost svarte uten gyldige data.");
  }
  return result.data;
}

export async function getGigahostOffers(): Promise<{ offers: InternalOffer[]; regions: { id: number; name: string }[] }> {
  const data = await requestGigahost<RawCatalog>("/deploy/servers");
  if (data.currency !== "NOK" || !Array.isArray(data.tiers)) throw new Error("Gigahost-katalogen er ikke gyldig.");
  const regions = (data.regions || [])
    .map((region) => ({ id: number(region.region_id), name: String(region.region_name || "Norge") }))
    .filter((region) => Number.isInteger(region.id));
  const offers: InternalOffer[] = [];
  for (const tier of data.tiers) {
    for (const product of tier.products || []) {
      if (!product.in_stock || !product.allow_recurring || !["vm", "dedicated"].includes(product.type || "") ||
          number(product.contract || 0) > 1) continue;
      const productId = number(product.product_id);
      const priceId = number(product.price_id);
      const supplierMonthlyNok = number(product.rate_monthly) + number(product.monthly_extra || 0);
      const supplierSetupNok = number(product.setup || 0);
      const regionIds = (product.region_ids || []).map(number).filter((id) => Number.isInteger(id));
      if (![productId, priceId, supplierMonthlyNok, supplierSetupNok].every(Number.isFinite) ||
          !productId || !priceId || supplierMonthlyNok <= 0 || !regionIds.length) continue;
      const specs = product.specs || {};
      const rawMemory = number(product.vm_memory);
      const ramGb = number(specs.ram_gb) || (rawMemory > 256 ? rawMemory / 1024 : rawMemory) || 0;
      const storageGb = Array.isArray(specs.disks)
        ? specs.disks.reduce((sum, disk) => sum + (number(disk.size_gb) || 0), 0)
        : number(product.vm_storage) || 0;
      const type = product.type as "vm" | "dedicated";
      offers.push({
        productId, priceId, name: String(product.product_name || "Server").slice(0, 100),
        type, cores: number(specs.cpu_cores) || number(product.vm_cores) || 0,
        cpuModel: specs.cpu_model || null, ramGb, storageGb, regionIds,
        supplierMonthlyNok, supplierSetupNok,
        monthlyNok: markedUp(supplierMonthlyNok),
        setupNok: markedUp(supplierSetupNok),
        backupsAvailable: type === "vm",
        canCheckout: supplierMonthlyNok <= COST_LIMIT_NOK && type !== "dedicated"
      });
    }
  }
  return { offers, regions };
}

export function quoteOffer(offer: InternalOffer, backups: boolean): {
  retailMonthlyNok: number; retailSetupNok: number; supplierMonthlyNok: number
} {
  if (backups && !offer.backupsAvailable) throw new Error("Backup tilbys ikke for denne serveren.");
  const supplierMonthlyNok = offer.supplierMonthlyNok * (backups ? 1.25 : 1);
  return {
    retailMonthlyNok: markedUp(supplierMonthlyNok),
    retailSetupNok: offer.setupNok,
    supplierMonthlyNok
  };
}

export async function deployGigahostServer(input: {
  productId: number; priceId: number; regionId: number; backups: boolean
}): Promise<number> {
  const osId = Number(process.env.GIGAHOST_DEFAULT_OS_ID);
  if (!Number.isInteger(osId) || osId <= 0) throw new Error("OS-mal må settes før levering.");
  const result = await requestGigahost<{ success?: boolean; order_ids?: (number | string)[] }>(
    "/deploy/servers", {
      body: {
        pid: input.productId,
        price_id: input.priceId,
        region_id: input.regionId,
        os_id: osId,
        quantity: 1,
        billing_period: "monthly",
        backups: input.backups ? 1 : 0
      }
    }
  );
  const orderId = Number(result.order_ids?.[0]);
  if (!result.success || !Number.isInteger(orderId) || orderId <= 0) {
    throw new Error("Gigahost returnerte ingen bekreftet ordre-ID.");
  }
  return orderId;
}
