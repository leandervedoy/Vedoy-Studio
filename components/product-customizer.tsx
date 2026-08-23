"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const products = [
  { name: "Essential Cotton T-Shirt", code: "RT0063", type: "T-skjorte", price: "fra $5.99", image: "/product-mockups/product-1.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Oversize Fleeced Hoodie", code: "R00286", type: "Hoodie", price: "fra $14.92", image: "/product-mockups/product-2.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Classic Loose Boxy Tee", code: "RU0034", type: "T-skjorte", price: "fra $9.99", image: "/product-mockups/product-3.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Essential Heavyweight Fleece Hoodie", code: "RW0035", type: "Hoodie", price: "fra $29.99", image: "/product-mockups/product-4.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Ribbed Long Sleeve", code: "CUSTOM", type: "Genser", price: "Se pris", image: "/product-mockups/product-5.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Classic Long Sleeve", code: "CUSTOM", type: "Langermet", price: "Se pris", image: "/product-mockups/product-6.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Contrast V-Neck Sweatshirt", code: "CUSTOM", type: "Genser", price: "Se pris", image: "/product-mockups/product-7.png", url: "https://www.tapstitch.com/custom-apparel" },
  { name: "Retro Zip Polo", code: "CUSTOM", type: "Polo", price: "Se pris", image: "/product-mockups/product-8.png", url: "https://www.tapstitch.com/custom-apparel" },
] as const;

export function ProductCustomizer() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const product = products[selected];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelected((current) => (current + 1) % products.length);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  function handleFile(file?: File) {
    if (!file) return;
    const acceptedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!acceptedTypes.includes(file.type)) {
      setUploadMessage("Bruk PNG, JPG, WebP eller SVG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage("Logoen må være mindre enn 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setUploadMessage("Logoen kunne ikke leses. Prøv en annen fil.");
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setUploadMessage("Logoen kunne ikke leses. Prøv en annen fil.");
        return;
      }
      setLogo(reader.result);
      setUploadMessage(`${file.name} er lastet opp.`);
    };
    reader.readAsDataURL(file);
  }

  function showPrevious() {
    setSelected((current) => (current - 1 + products.length) % products.length);
  }

  function showNext() {
    setSelected((current) => (current + 1) % products.length);
  }

  return (
    <div className="product-customizer">
      <div className="customizer-stage">
        <div className="garment-photo">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={product.image}
              src={product.image}
              alt={`${product.name} fra Tapstitch`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, x: 16 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985, x: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.22, 0.8, 0.32, 1] }}
            />
          </AnimatePresence>
          {logo ? <div className="garment-logo"><img src={logo} alt="Opplastet logo" /></div> : null}
        </div>
      </div>
      <div className="customizer-simple-controls">
        <button type="button" className="customizer-arrow" onClick={showPrevious} aria-label="Forrige plagg">←</button>
        <label className="customizer-upload">
          <span>{logo ? "Bytt logo" : "Last opp logo"}</span>
          <input className="customizer-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => { handleFile(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
        <button type="button" className="customizer-arrow" onClick={showNext} aria-label="Neste plagg">→</button>
      </div>
      <p className="customizer-upload-status" aria-live="polite">{uploadMessage}</p>
      <div className="customizer-dots" aria-label="Velg plagg">
        {products.map((item, index) => <button type="button" className={index === selected ? "is-selected" : ""} onClick={() => setSelected(index)} aria-label={`Vis ${item.name}`} key={item.image} />)}
      </div>
      <p className="customizer-simple-name">{product.name}</p>
    </div>
  );
}
