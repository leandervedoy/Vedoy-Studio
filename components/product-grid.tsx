import { useCopy } from "@/i18n/use-copy";
import Link from "next/link";
import { productGroups, studioProducts } from "@/lib/products";

const statusLabels = { live: "Publisert", beta: "Beta", planned: "Planlagt", demo: "Demo" };
const actionLabels = { live: "Åpne", beta: "Utforsk beta", planned: "Meld interesse", demo: "Utforsk demo" };

export function ProductGrid() {
  const c = useCopy();

  return (
    <div className="product-groups">
      {productGroups.map((group) => (
        <section key={c(group)} className="product-group">
          <div className="product-group__heading">
            <span>{String(productGroups.indexOf(group) + 1).padStart(2, "0")}</span>
            <h3>{c(group)}</h3>
          </div>
          <div className="product-grid">
            {studioProducts.filter((product) => product.group === group).map((product) => (
              <Link key={product.id} href={`/projects/${product.id}`} className="product-card" style={{ "--product-accent": product.accent } as React.CSSProperties}>
                <div className="product-card__top">
                  <span className="product-icon">{product.icon}</span>
                  <span className={`product-status product-status--${product.status}`}>{c(statusLabels[product.status])}</span>
                </div>
                <h4>{c(product.name)}</h4>
                <p>{c(product.description)}</p>
                <ul>
                  {product.highlights.map((highlight) => <li key={c(highlight)}>{c(highlight)}</li>)}
                </ul>
                <span className="product-card__link">{c(actionLabels[product.status])} <span aria-hidden>↗</span></span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
