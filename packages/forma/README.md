# Vedoy Forma — UI library (beta)

A lightweight collection of **50 styled, responsive, semantic HTML examples** and optional vanilla JavaScript interactions. Built independently of Vedoy Forge.

**Current status:** Internal beta, `private: true`. It has **not** been published to npm. The gallery is available in the Vedoy Studio branch at `/developers/forma/components`.

## Project structure

- `styles.css`: 50 example patterns, scoped under the `vf-` CSS namespace; Flexbox, Grid, container queries, mobile layout and reduced-motion handling.
- `index.js`: optional progressive enhancements for drawers, tabs, dropdowns, dialog, toast, carousel, and gallery tiles.
- `index.d.ts`: TypeScript declarations.
- `tests/registry.test.mjs`: structural checks.
- `../../lib/forma-components.ts`: trusted HTML example registry used by the documentation gallery.

These are **styled UI patterns**, not 50 published React components. Contact, login and registration forms are presentational and do not send or store data. Backend integrations must be designed separately.

## Use locally in the Studio monorepo

```tsx
import "@/packages/forma/styles.css";
```

Basic HTML:

```html
<button class="vf-button">Fortsett</button>
<div class="vf-bento-grid">
  <article class="vf-bento-hero"><h3>Din oversikt</h3></article>
  <article><strong>27</strong><small>Aktive prosjekter</small></article>
</div>
```

For interactive controls on the client:

```js
import { initForma } from "./index.js";
const cleanup = initForma(document);
// Run cleanup() when the preview is removed.
```

`initForma` is designed for browser contexts and does not run server-side by default.

## Menu builder

The interactive Menu Builder lets visitors change:
- Menu placement: top, bottom, left, right
- Position: static, sticky, fixed
- Typeface, font size, spacing, corner radius
- Foreground, background and accent colors
- Shadows, logo text and editable menu items (up to eight)

It exports escaped static HTML and CSS. No backend is required. For a real product use valid links, verify breakpoints and check contrast and keyboard navigation.

## 50 example components

| Category | Patterns |
| --- | --- |
| Navigation (11) | Navbar, Sidebar, Bottom navigation, Drawer, Flexible menu, Bento menu, Dropdown, Breadcrumbs, Pagination, Tabs, Stepper |
| Forms (12) | Contact, Login, Register, Input, Textarea, Select, Checkbox, Radio, Switch, Range, File upload, Search |
| Content (12) | Button, Icon button, Button group, Card, Bento grid, Badge, Avatar, Statistics, Pricing, Testimonial, Profile, Hero |
| Feedback (10) | Alert, Toast, Progress, Spinner, Skeleton, Tooltip, Popover, Modal, Accordion, Empty state |
| Media & data (5) | Gallery, Carousel, Table, Timeline, Calendar |

Total: **50** curated examples.

## Quality and accessibility

- Semantic HTML, accessible labels where needed, keyboard interaction for tabs and native dialogs
- Responsive layout using CSS Grid/Flexbox and container queries
- `prefers-reduced-motion` support
- Optional JavaScript; most patterns are CSS-only
- Scoped `vf-` selectors to avoid collisions with Vedoy Studio

These are **beta patterns**. Accessibility still requires audits in actual usage, especially for navigation drawers, alerts, validation states, color contrast, and mobile viewport behavior. Do not claim a WCAG certification without manual and automated testing.

## Motion status

Vedoy Motion 1.0.0 exists in the existing `vedoy-css` Vercel source as:
- `vedoy-motion.css`
- `vedoy-motion.js`
- `vedoy-motion.mjs`
- `motion.html` demo

It declares 15 motion names and includes reduced-motion aware scroll-reveal. Motion is optional for Forma and is not bundled into this package.

## Next steps before public npm release

1. Verify code example installation in a fresh HTML project and a React/Next.js app.
2. Build browser-level keyboard and screen-reader tests.
3. Audit/complete component interactions and add real service adapter recipes.
4. Choose a public license and versioning policy.
5. Set up npm publishing and release integrity (e.g. trusted publishing).
6. Convert popular patterns into independently imported React/Vue wrappers if requested.

Developed by Vedoy Studio.
