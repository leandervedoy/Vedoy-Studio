/**
 * Vedoy Forma optional interactions v0.1 beta.
 * Static components work with CSS alone. This module enhances demonstrations.
 * It does not provide authentication, message delivery or storage.
 */
export const formaVersion = "0.1.0-beta.1";

/** Attach event delegation to a preview root; returns cleanup. */
export function initForma(root = document) {
  if (!root || typeof root.addEventListener !== "function") return () => {};
  const controller = new AbortController();
  const signal = controller.signal;
  let opener = null;

  const getTarget = (event) => event.target instanceof Element ? event.target : null;
  const findWithin = (selector) => root.querySelector(selector);

  function showTab(tab) {
    const list = tab.closest('[role="tablist"]');
    const parent = list?.closest("[data-vf-tabs]");
    if (!parent || !list) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panelId = item.getAttribute("aria-controls");
      const panel = panelId ? parent.querySelector('#' + CSS.escape(panelId)) : null;
      if (panel) panel.hidden = !selected;
    }
  }

  function closeDrawer() {
    const drawer = findWithin(".vf-drawer:not([hidden])");
    if (!drawer) return;
    drawer.hidden = true;
    if (opener?.isConnected) opener.focus();
    opener = null;
  }

  root.addEventListener("click", (event) => {
    const target = getTarget(event);
    if (!target) return;
    const openDrawer = target.closest("[data-vf-drawer-open]");
    if (openDrawer) {
      const id = openDrawer.getAttribute("data-vf-drawer-open");
      const drawer = id ? findWithin("#" + CSS.escape(id)) : null;
      if (drawer) {
        opener = openDrawer;
        drawer.hidden = false;
        drawer.querySelector("button, a, input")?.focus();
      }
      return;
    }
    if (target.closest("[data-vf-drawer-close]")) {closeDrawer();return;}

    const dropdownTrigger = target.closest("[data-vf-dropdown]");
    if (dropdownTrigger) {
      const panel = dropdownTrigger.parentElement?.querySelector(".vf-dropdown-panel");
      if (panel) {
        const next = !panel.hidden;
        panel.hidden = next;
        dropdownTrigger.setAttribute("aria-expanded", String(!next));
      }
      return;
    }
    if (target.closest(".vf-dropdown-panel button")) {
      const panel = target.closest(".vf-dropdown-panel");
      panel.hidden = true;
      const trigger = panel.parentElement?.querySelector("[data-vf-dropdown]");
      trigger?.setAttribute("aria-expanded", "false");
      trigger?.focus();
      return;
    }

    const tab = target.closest('[role="tab"]');
    if (tab && tab.closest("[data-vf-tabs]")) {showTab(tab);return;}

    const dialogTrigger = target.closest("[data-vf-dialog-open]");
    if (dialogTrigger) {
      const id = dialogTrigger.getAttribute("data-vf-dialog-open");
      const dialog = id ? findWithin("#" + CSS.escape(id)) : null;
      if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
      return;
    }

    const toastTrigger = target.closest("[data-vf-toast]");
    if (toastTrigger) {
      const region = toastTrigger.closest(".vf-toast-demo")?.querySelector(".vf-toast-region");
      if (region) region.textContent = toastTrigger.getAttribute("data-vf-toast") || "Utført";
      return;
    }

    const carouselTrigger = target.closest("[data-vf-carousel]");
    if (carouselTrigger) {
      const track = carouselTrigger.closest(".vf-carousel")?.querySelector(".vf-carousel-track");
      const dir = Number(carouselTrigger.getAttribute("data-vf-carousel") || 0);
      if (track && Number.isFinite(dir)) {
        const card = track.querySelector("article");
        const width = card ? card.getBoundingClientRect().width + 12 : track.clientWidth * .6;
        track.scrollBy({left: width * dir, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
      }
      return;
    }

    const galleryTile = target.closest("[data-vf-lightbox]");
    if (galleryTile) {
      // Demo gallery: avoid opening arbitrary URLs or fetching untrusted media.
      const gallery = galleryTile.closest(".vf-gallery");
      gallery?.querySelectorAll("[data-vf-lightbox]").forEach(tile => tile.setAttribute("aria-pressed", String(tile === galleryTile)));
      return;
    }
  }, {signal});

  root.addEventListener("keydown", event => {
    const target = getTarget(event);
    if (!target) return;
    if (event.key === "Escape") {
      closeDrawer();
      const dropdown = findWithin(".vf-dropdown-panel:not([hidden])");
      if (dropdown) {
        dropdown.hidden = true;
        const trigger = dropdown.parentElement?.querySelector("[data-vf-dropdown]");
        trigger?.setAttribute("aria-expanded", "false");
        trigger?.focus();
      }
      return;
    }
    const tab = target.closest('[role="tab"]');
    if (!tab || !tab.closest("[data-vf-tabs]")) return;
    const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (next >= 0) {
      event.preventDefault();
      showTab(tabs[next]);
      tabs[next].focus();
    }
  }, {signal});

  root.addEventListener("submit", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains("vf-form")) return;
    // Never send/store private data from example form.
    event.preventDefault();
    const info = form.querySelector(".vf-hint");
    if (info) {
      info.textContent = "Demo: skjemaet er validert lokalt, men ingen data er sendt.";
      info.setAttribute("role", "status");
    }
  }, {signal});

  return () => {controller.abort();closeDrawer();};
}

export default {version:formaVersion,initForma};
