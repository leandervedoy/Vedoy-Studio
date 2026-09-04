import Link from "next/link";
import { productGroups, studioProducts } from "@/lib/products";

const statusLabels = { live: "Publisert", beta: "Beta", planned: "Planlagt" };

export function ProductGrid() {
  return (
    <div className="product-groups">
      {productGroups.map((group) => (
        <section key={group} className="product-group">
          <div className="product-group__heading">
            <span>{String(productGroups.indexOf(group) + 1).padStart(2, "0")}</span>
            <h3>{group}</h3>
          </div>
          <div className="product-grid">
            {studioProducts.filter((product) => product.group === group).map((product) => (
              <Link key={product.id} href={product.href} className="product-card" style={{ "--product-accent": product.accent } as React.CSSProperties}>
                <div className="product-card__top">
                  <span className="product-icon">{product.icon}</span>
                  <span className={`product-status product-status--${product.status}`}>{statusLabels[product.status]}</span>
                </div>
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <ul>
                  {product.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>
                <span className="product-card__link">Utforsk <span aria-hidden>↗</span></span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
