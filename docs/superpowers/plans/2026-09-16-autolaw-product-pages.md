# Autolaw Product Pages Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the revised Product experience: an accessible phase-based nav, linked home cards, thirteen persuasive feature pages, enforceable claim guards, a buyer-first Security page, owner-supplied About content, and release-grade verification.

**Architecture:** `src/data/product.ts` remains the single source of truth for feature availability, routes, page copy, related links, and metadata. One `FeaturePage` component renders every product route; thin entry files only select an id. The nav and home section derive from the same feature data, while route, sitemap, metadata, and claim-guard tests prevent drift.

**Tech Stack:** React 18, TypeScript, Vite multi-page build, Vitest + Testing Library, ESLint with jsx-a11y, hand-written CSS using the existing `--al-*` design tokens.

**Spec:** `docs/superpowers/specs/2026-09-15-autolaw-product-section-design.md` (§4 revised 2026-09-16; its stale §9 sentence naming feature pages as a non-goal is superseded by §4, the handoff, and the owner’s current instruction.)

## Global Constraints

- `Discovery Responses` and `Deposition Review` stay `coming-next`, always display that label, never link, and never receive routes.
- `Accident & Injury Illustrations` stays `early-access`; its hero must state that Autolaw’s team runs it with the firm during a pilot.
- No illustration accuracy percentage and none of: “medically validated”, “expert-reviewed”, “court-admissible”, “clinician-approved”, “3D”, or surgical-procedure claims.
- No rendered media-engine sample may ship; every existing demo panel keeps its visible “Sample data” mark.
- Nothing links to `app.autolaw.ai`; `TRIAL_ENABLED` remains `false` and `LOGIN_URL` remains `null`.
- Product and page copy is outcome-first, contains no unmeasured result, and makes no named competitor comparison.
- Customer logos, customer metrics, legal text, and About history/team content render nothing until real owner-supplied data exists.
- The visual direction may borrow pacing and information architecture from Anytime AI and EvenUp, but must retain Autolaw’s navy/paper/teal design system and factual boundaries.

## File Structure

- `src/data/product.ts`: feature names, availability, slug, metadata, page promise/body/steps/limits/related ids.
- `src/components/ProductMenu.tsx`: shared desktop/mobile phase lists derived from feature data.
- `src/components/SiteNav.tsx`: desktop dropdown state and mobile drawer composition.
- `src/sections/product/FeatureCard.tsx`: linked card for routed features and inert labelled card for coming-next features.
- `src/pages/product/FeaturePage.tsx`: the only product-page renderer.
- `src/pages/product/FeaturePage.css`: shared product-page layout and excitement-forward visual pacing.
- `product/<slug>/index.html` and `main.tsx`: metadata-bearing Vite directory entries.
- `src/__tests__/claims.test.tsx`: rendered and raw-metadata claim guard for all pages.
- `src/pages/__tests__/productRoutes.test.ts`: exact equality among data slugs, Vite entries, route directories, and sitemap URLs.
- `src/pages/security/SecurityPage.tsx`: buyer-question order, legal-ethics questions, and illustration safeguards.
- `src/pages/about/AboutPage.tsx`: owner-supplied story, team, and roles only.

---

### Task 1: Make product destinations part of the data contract

**Files:**
- Modify: `src/data/product.ts`
- Modify: `src/data/__tests__/product.test.ts`

**Interfaces:**
- Produces: `FeaturePage`, `FeatureMeta`, `Feature.slug?: string`, `Feature.page?: FeaturePage`, `FEATURE_BY_ID`, `ROUTED_FEATURES`.
- Invariant: `slug` and `page` are both present or both absent; only `live` and `early-access` features may be routed.

- [ ] **Step 1: Write failing data-contract tests**

```ts
expect(ROUTED_FEATURES).toHaveLength(13);
expect(FEATURES.filter((f) => f.availability === 'coming-next').every((f) => !f.slug && !f.page)).toBe(true);
for (const feature of ROUTED_FEATURES) {
  expect(feature.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  expect(feature.page?.body.length).toBeGreaterThanOrEqual(2);
  expect(feature.page?.steps).toHaveLength(3);
  expect(feature.page?.limits.length).toBeGreaterThanOrEqual(2);
  expect(feature.page?.related.length).toBeGreaterThanOrEqual(2);
  expect(feature.page?.meta.title).toMatch(/Autolaw$/);
}
expect(FEATURE_BY_ID.size).toBe(FEATURES.length);
```

- [ ] **Step 2: Run the focused test and confirm the new exports are missing**

Run: `npx vitest run src/data/__tests__/product.test.ts`
Expected: FAIL on missing `ROUTED_FEATURES` / `FEATURE_BY_ID` and page fields.

- [ ] **Step 3: Add the exact page interfaces and derived exports**

```ts
export interface FeatureMeta {
  title: string;
  description: string;
}

export interface FeaturePage {
  promise: string;
  body: ReadonlyArray<string>;
  steps: ReadonlyArray<{ heading: string; body: string }>;
  limits: ReadonlyArray<string>;
  related: ReadonlyArray<string>;
  meta: FeatureMeta;
}

export const FEATURE_BY_ID = new Map(FEATURES.map((feature) => [feature.id, feature]));
export const ROUTED_FEATURES = FEATURES.filter(
  (feature): feature is Feature & { slug: string; page: FeaturePage } => Boolean(feature.slug && feature.page),
);
```

Populate the thirteen settled slugs exactly:

```ts
[
  'ask-al',
  'medical-chronologies',
  'medical-significance-brief',
  'missing-records-and-gaps',
  'qme-ame-deep-analysis',
  'damages-ledger',
  'demand-packages',
  'case-value-and-howell-analysis',
  'negotiation-tracking',
  'case-management-summary',
  'conflicting-records-and-opinions',
  'deadlines-and-statute-of-limitations',
  'accident-and-injury-illustrations',
]
```

Each page object supplies two grounded paragraphs, three short workflow steps, at least two explicit refusals, two or three related feature ids, and unique search metadata. The illustrations page hero/body must say “Early access” and “Our team runs the pilot with your firm on your case.”

- [ ] **Step 4: Run the product data tests**

Run: `npx vitest run src/data/__tests__/product.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit the data contract**

```bash
git add src/data/product.ts src/data/__tests__/product.test.ts
git commit -m "Define every product page from feature data"
```

---

### Task 2: Replace disclosures with linked home cards

**Files:**
- Modify: `src/sections/product/FeatureCard.tsx`
- Modify: `src/sections/product/Product.tsx`
- Modify: `src/sections/product/Product.css`
- Modify: `src/sections/product/__tests__/FeatureCard.test.tsx`
- Modify: `src/sections/product/__tests__/Product.test.tsx`

**Interfaces:**
- Consumes: `Feature.slug`, `Feature.availability`, `AVAILABILITY_LABEL`.
- Produces: a whole-card link to `/product/<slug>/` for routed features; a non-interactive article for coming-next features.

- [ ] **Step 1: Replace disclosure tests with destination tests**

```tsx
expect(screen.getByRole('link', { name: /medical chronologies/i })).toHaveAttribute(
  'href',
  '/product/medical-chronologies/',
);
expect(screen.queryByRole('button')).not.toBeInTheDocument();
expect(screen.getByText('Discovery Responses').closest('[data-availability="coming-next"]')).not.toContainHTML('<a');
```

- [ ] **Step 2: Run the focused tests and confirm they fail against disclosure buttons**

Run: `npx vitest run src/sections/product/__tests__/FeatureCard.test.tsx src/sections/product/__tests__/Product.test.tsx`
Expected: FAIL because cards are buttons and details/visuals still expand on the home page.

- [ ] **Step 3: Implement linked cards and remove home-page visual ownership**

`FeatureCard` keeps name, practice badge, availability label, practice-specific line, and a visual arrow. Routed cards render as anchors; coming-next cards render as `<article>` with no anchor. Delete React state, `aria-expanded`, detail/output rendering, and the `visual` prop. Remove `VISUALS` and visual imports from `Product.tsx`. Change the Product intro to invite exploration rather than expansion.

- [ ] **Step 4: Polish cards as sales destinations**

Use a stronger title scale, a subtle navy-to-paper hover lift, arrow movement under the existing motion tokens, and `:focus-visible` treatment. Keep Pre-Litigation first on narrow screens and the coming-next block visually distinct.

- [ ] **Step 5: Run the focused tests**

Run: `npx vitest run src/sections/product/__tests__/FeatureCard.test.tsx src/sections/product/__tests__/Product.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit linked cards**

```bash
git add src/sections/product
git commit -m "Turn the home product grid into feature destinations"
```

---

### Task 3: Add the accessible Product dropdown

**Files:**
- Create: `src/components/ProductMenu.tsx`
- Modify: `src/components/SiteNav.tsx`
- Modify: `src/components/SiteNav.css`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `src/components/__tests__/SiteNav.test.tsx`
- Modify: `src/components/__tests__/SiteFooter.test.tsx`

**Interfaces:**
- Consumes: `FEATURES`, `PHASES`, `ASK_AL_FEATURE_ID`, `ASK_AL_ENABLED`.
- Produces: `ProductMenu({ mobile, onNavigate })`, where desktop links only routed features and the coming-next area is labelled/inert.

- [ ] **Step 1: Write dropdown behavior tests**

```tsx
const product = screen.getByRole('button', { name: /product/i });
expect(product).toHaveAttribute('aria-expanded', 'false');
await user.click(product);
expect(product).toHaveAttribute('aria-expanded', 'true');
expect(screen.getByRole('link', { name: /^Medical Chronologies/ })).toHaveAttribute(
  'href', '/product/medical-chronologies/',
);
await user.keyboard('{Escape}');
expect(product).toHaveAttribute('aria-expanded', 'false');
```

Also test mouse enter/leave, focus leaving the menu, DOM order, Ask AL’s kill switch, no link for coming-next features, and a mobile nested list that is present whenever the drawer is open without a second disclosure.

- [ ] **Step 2: Run nav tests and confirm the Product control is absent**

Run: `npx vitest run src/components/__tests__/SiteNav.test.tsx src/components/__tests__/SiteFooter.test.tsx`
Expected: FAIL on missing Product menu button and nested mobile phase lists.

- [ ] **Step 3: Implement a semantic desktop popover and always-expanded mobile list**

Use a real `<button aria-expanded aria-controls="product-menu">`, an adjacent home-section link whose accessible name is “Product overview”, two phase headings, and route links in feature-data order. Close on Escape, focus moving outside the menu root, navigation, and desktop pointer leave. Do not add positive tabindex or roving tabindex.

- [ ] **Step 4: Add the Security shield mark in nav and footer**

Render a small CSS/icon-library shield with `aria-hidden="true"` before the Security label. It remains plain-link text and must not mention certification.

- [ ] **Step 5: Run nav/footer tests and a11y**

Run: `npx vitest run src/components/__tests__/SiteNav.test.tsx src/components/__tests__/SiteFooter.test.tsx src/__tests__/a11y.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit navigation**

```bash
git add src/components
git commit -m "Add the phase-based Product menu"
```

---

### Task 4: Build one data-fed FeaturePage and its thirteen routes

**Files:**
- Create: `src/pages/product/FeaturePage.tsx`
- Create: `src/pages/product/FeaturePage.css`
- Create: `src/pages/product/__tests__/FeaturePage.test.tsx`
- Create: `product/<slug>/index.html` (13 files)
- Create: `product/<slug>/main.tsx` (13 files)
- Modify: `vite.config.ts`
- Modify: `public/sitemap.xml`
- Modify: `src/pages/__tests__/pages.test.tsx`

**Interfaces:**
- Consumes: `FeaturePage({ id }: { id: string })`, `FEATURE_BY_ID`, practice context.
- Produces: full standalone page with hero, detail/body, optional demo panel, steps, limits, output, related links, and close CTA.

- [ ] **Step 1: Write failing shared-page tests**

```tsx
render(<FeaturePage id="medical-chronologies" />);
expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
expect(screen.getByTestId('state-chronology').closest('.al-stage.al-on-navy')).toBeInTheDocument();
expect(screen.getByText(/sample data/i)).toBeInTheDocument();
expect(screen.getByRole('region', { name: /what it will not do/i })).toBeInTheDocument();
expect(screen.getAllByRole('link', { name: /schedule a call/i })).not.toHaveLength(0);
```

Use `it.each(ROUTED_FEATURES)` to verify every id renders its promise, output, three steps, all limits, related route links, and no app-origin link. Verify the illustrations hero visibly says Early access and pilot before the first content section.

- [ ] **Step 2: Run the new test and confirm the component is missing**

Run: `npx vitest run src/pages/product/__tests__/FeaturePage.test.tsx`
Expected: FAIL because `FeaturePage` does not exist.

- [ ] **Step 3: Implement the shared page and visual registry**

```tsx
const VISUALS: Partial<Record<string, ReactNode>> = {
  'ask-al': <StatePanel><AskPreview animate={false} /></StatePanel>,
  'medical-chronologies': <StatePanel><ChronologyState /></StatePanel>,
  'missing-records': <StatePanel><Arrival /></StatePanel>,
  'case-management-summary': <StatePanel><Output /></StatePanel>,
  conflicts: <StatePanel><Review /></StatePanel>,
};
```

Use the shared `PageShell`, `Section`, `Button`, and existing practice context. The hero should be visually bolder than ordinary subpages: a navy lead, compact phase/practice chips, large promise, line, CTA, and—where available—the existing state panel. Never render a made-up illustration for the illustrations page.

- [ ] **Step 4: Add all directory entries**

Each `main.tsx` is only the global CSS import, `createRoot`, and `<FeaturePage id="..." />`. Each `index.html` has unique title, description, canonical, `og:title`, `og:description`, and `og:url`, plus the standard fonts/icons/script entry.

- [ ] **Step 5: Register all routes**

Add thirteen `product...` keys to `vite.config.ts`, thirteen canonical URLs to `public/sitemap.xml`, and thirteen `FeaturePage` elements to the standalone-page structural test matrix.

- [ ] **Step 6: Run component and page-structure tests**

Run: `npx vitest run src/pages/product/__tests__/FeaturePage.test.tsx src/pages/__tests__/pages.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit feature pages**

```bash
git add src/pages/product product vite.config.ts public/sitemap.xml src/pages/__tests__/pages.test.tsx
git commit -m "Publish thirteen data-fed product pages"
```

---

### Task 5: Extend the claim and route guards

**Files:**
- Modify: `src/__tests__/claims.test.tsx`
- Create: `src/pages/__tests__/productRoutes.test.ts`

**Interfaces:**
- Consumes: `ROUTED_FEATURES`, route HTML paths, `vite.config.ts`, `public/sitemap.xml`.
- Produces: exact route-set equality and retired-claim scanning across every product render and metadata file.

- [ ] **Step 1: Add the new retired patterns and all product pages to the scan**

```ts
{ pattern: /\bmedically validated\b|\bexpert[- ]reviewed\b|\bcourt[- ]admissible\b|\bclinician[- ]approved\b/i, reason: 'unverified illustration claim' },
{ pattern: /\b3D\b|\bsurgical procedure(s)?\b/i, reason: 'illustration capability not supported for publication' },
{ pattern: /illustration[^.]{0,120}\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*%[^.]{0,120}illustration/i, reason: 'no measured illustration accuracy may be published' },
```

Render every `FeaturePage` id and scan every product `index.html` raw.

- [ ] **Step 2: Add route parity assertions**

Read `vite.config.ts`, `public/sitemap.xml`, and `product/*/index.html`; normalize each to slugs and assert exact equality with `ROUTED_FEATURES.map((feature) => feature.slug)`. Assert no coming-next id or name appears in any route path.

- [ ] **Step 3: Run guards**

Run: `npx vitest run src/__tests__/claims.test.tsx src/pages/__tests__/productRoutes.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit guards**

```bash
git add src/__tests__/claims.test.tsx src/pages/__tests__/productRoutes.test.ts
git commit -m "Guard product claims and route parity"
```

---

### Task 6: Reorder Security around buyer questions

**Files:**
- Modify: `src/pages/security/SecurityPage.tsx`
- Modify: `src/pages/security/SecurityPage.css`
- Modify: `src/pages/security/__tests__/SecurityPage.test.tsx`

**Interfaces:**
- Keeps all existing verified controls.
- Adds only question-framed legal-ethics guidance and verified illustration safeguards.

- [ ] **Step 1: Write tests for order and new grounded content**

Assert section heading DOM order: “Does my client’s medical data stay private?” → “Does my case train your model?” → “What do I tell my client?” Then assert links to official California bar guidance, explicit “general information, not legal advice” framing, and the illustration safeguards: sufficiency refusal, evidence-bound scenes, re-inspection for impact direction/spinal level, attorney approval, and hash verification.

- [ ] **Step 2: Run Security tests and confirm the new questions are absent**

Run: `npx vitest run src/pages/security/__tests__/SecurityPage.test.tsx`
Expected: FAIL on new heading/order and illustration controls.

- [ ] **Step 3: Recompose existing verified content**

Lead with privacy/access, then no-training/retention, then client-disclosure/privilege/cost questions. Keep the attestation/BAA and model-limits material, but move them beneath the three buyer questions. Legal-ethics copy asks what a firm should decide and points out to State Bar guidance; it does not answer those questions for the firm.

- [ ] **Step 4: Add illustration accuracy controls without a rendered illustration or percentage**

Present the verified pipeline as a numbered safeguard sequence and label the capability Early access.

- [ ] **Step 5: Run Security and site-wide claim tests**

Run: `npx vitest run src/pages/security/__tests__/SecurityPage.test.tsx src/__tests__/claims.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit Security**

```bash
git add src/pages/security
git commit -m "Answer Security in the order firms ask"
```

---

### Task 7: Fill About only from the owner interview

**Files:**
- Modify: `src/pages/about/AboutPage.tsx`
- Modify: `src/pages/about/__tests__/AboutPage.test.tsx`

**Interfaces:**
- Inputs: owner’s six interview answers covering origin, collaborators, first-firm use, refusals, current team, and whether roles are public.
- Produces: real `STORY`, `TEAM`, and optional `OPEN_ROLES`; unanswered slots remain empty and invisible.

- [ ] **Step 1: Record the owner’s answers in tests as factual expectations**

Write assertions against the exact supplied names, roles, and story facts. Delete only the “slots are empty” expectations whose inputs were actually supplied; retain the anti-invention guards for customer counts, funding, headcount, and unsupplied roles.

- [ ] **Step 2: Run About tests and confirm the owner content is absent**

Run: `npx vitest run src/pages/about/__tests__/AboutPage.test.tsx`
Expected: FAIL on the owner-supplied facts.

- [ ] **Step 3: Fill only answered slots**

Shape interview answers into concise first-person-neutral marketing prose. Do not infer a title, founding date, customer name, team size, funding, or open role.

- [ ] **Step 4: Run About and claim tests**

Run: `npx vitest run src/pages/about/__tests__/AboutPage.test.tsx src/__tests__/claims.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit About**

```bash
git add src/pages/about
git commit -m "Tell the Autolaw story from the owner interview"
```

---

### Task 8: Full verification and visual QA

**Files:**
- Modify only files whose verification exposes defects.

- [ ] **Step 1: Run the complete automated gate**

Run: `npm test`
Expected: ESLint and all Vitest tests PASS.

- [ ] **Step 2: Type-check and build every directory entry**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS; `build/product/<slug>/index.html` exists for exactly thirteen slugs.

- [ ] **Step 3: Re-run design-system contrast verification**

Run: `npm run ds`
Expected: PASS; add any new foreground/background pair to `design-system/build.mjs` before accepting it.

- [ ] **Step 4: Inspect representative desktop and mobile states**

At minimum verify home with dropdown open, home mobile drawer, Medical Chronologies page, a no-visual page, Illustrations early-access page, Security, and About. Check keyboard order, Escape, focus leaving, hover stability, section spacing, line length, card hover/focus, responsive stacking, sample-data marks, and zero links to `app.autolaw.ai`.

- [ ] **Step 5: Verify the clean URL in Docker when Docker is available**

Run: `docker build -t autolaw-site:verify .` then serve the image and request `/product/medical-chronologies/`.
Expected: HTTP 200 containing the feature page’s unique title. If Docker is unavailable, record that this deploy-only check remains pending rather than claiming it passed.

- [ ] **Step 6: Confirm repository scope**

Run: `git status --short && git diff --check`
Expected: only intended changes; no downloaded reference artifacts, build output, or temporary screenshots.

- [ ] **Step 7: Commit verification fixes**

```bash
git add <only-files-fixed-during-verification>
git commit -m "Polish and verify the product-page release"
```

