/** Draft metadata: do not expose purchase links before secure fulfillment and tax review. */
export const vedoyClearCssProduct = {
  id: "vedoy-clear-css-essentials",
  slug: "vedoy-clear-css",
  title: "Vedoy Clear CSS – Essentials",
  version: "1.0.0",
  category: "Utviklerverktøy",
  status: "draft" as const,
  delivery: "secure-download-pending" as const,
  type: "digital_download" as const,
  license: "single_project_commercial" as const,
  prices: {
    NOK: { amountMinor: 2900, formatted: "29 kr" },
    USD: { amountMinor: 400, formatted: "$4.00" },
    EUR: { amountMinor: 300, formatted: "€3.00" },
    GBP: { amountMinor: 300, formatted: "£3.00" }
  }
} as const;
