#!/usr/bin/env node
/*
 * Autolaw design system build.
 *
 *   1. Verifies every declared color pair against its WCAG requirement. Fails loud.
 *   2. Inlines tokens.css into each preview fragment so previews are self-contained
 *      (Claude Design renders each card in isolation — no shared stylesheet reaches them).
 *   3. Emits dist/ ready to push via DesignSync.
 *
 * Run: node design-system/build.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(HERE, "tokens.css");
const SRC = join(HERE, "previews");
const DIST = join(HERE, "dist");

/* ------------------------------------------------------------------ contrast */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function parseTokens(css) {
  const out = {};
  for (const [, name, value] of css.matchAll(/(--al-[\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
    out[name] = value;
  }
  return out;
}

/*
 * Declared requirements. `min` is the ratio the pair must meet.
 *   4.5 = AA normal text · 3.0 = AA large text and non-text UI
 * A pair marked `mustFail` documents a deliberate constraint: it records WHY a token is
 * restricted, so a future edit that "fixes" it trips the build instead of silently
 * loosening the rule.
 */
const PAIRS = [
  { fg: "--al-ink", bg: "--al-canvas", min: 4.5, use: "body + display text" },
  { fg: "--al-ink-muted", bg: "--al-canvas", min: 4.5, use: "secondary text" },
  { fg: "--al-teal-text", bg: "--al-canvas", min: 4.5, use: "links, interactive text" },
  { fg: "--al-amber-text", bg: "--al-canvas", min: 4.5, use: "conflict copy" },
  { fg: "--al-ink", bg: "--al-surface", min: 4.5, use: "text on cards" },
  { fg: "--al-ink-muted", bg: "--al-surface", min: 4.5, use: "secondary on cards" },
  { fg: "--al-teal-text", bg: "--al-teal-wash", min: 4.5, use: "verified chip" },
  { fg: "--al-amber-text", bg: "--al-amber-wash", min: 4.5, use: "conflict chip" },
  { fg: "--al-ink-inverse", bg: "--al-navy", min: 4.5, use: "text on navy panels" },
  { fg: "--al-ink-inverse-muted", bg: "--al-navy", min: 4.5, use: "secondary on navy" },
  { fg: "--al-teal", bg: "--al-navy", min: 4.5, use: "teal accent on navy — the governing rule" },
  { fg: "--al-teal", bg: "--al-navy-raised", min: 3.0, use: "teal on raised navy (non-text)" },
  { fg: "--al-ink-inverse", bg: "--al-navy-raised", min: 4.5, use: "text on raised navy" },
  { fg: "--al-amber", bg: "--al-navy", min: 3.0, use: "conflict indicator on navy" },
  {
    fg: "--al-teal",
    bg: "--al-canvas",
    min: 3.0,
    mustFail: true,
    use: "teal on canvas — MUST fail; this is why --al-teal-text exists",
  },
];

const tokens = parseTokens(readFileSync(TOKENS, "utf8"));
const results = [];
let failed = 0;

for (const pair of PAIRS) {
  const fg = tokens[pair.fg];
  const bg = tokens[pair.bg];
  if (!fg || !bg) {
    console.error(`MISSING TOKEN: ${pair.fg} or ${pair.bg}`);
    failed++;
    continue;
  }
  const ratio = contrast(fg, bg);
  const passes = ratio >= pair.min;
  const ok = pair.mustFail ? !passes : passes;
  if (!ok) failed++;
  results.push({ ...pair, fg, bg, ratio, ok });
}

const pad = (s, n) => String(s).padEnd(n);
console.log("\n  Autolaw design system — contrast verification\n");
for (const r of results) {
  const mark = r.ok ? "  ok  " : " FAIL ";
  const note = r.mustFail ? `(must stay under ${r.min})` : `(needs ${r.min})`;
  console.log(
    `${mark} ${pad(r.fg.replace("--al-", ""), 18)} on ${pad(
      r.bg.replace("--al-", ""),
      14
    )} ${pad(r.ratio.toFixed(2) + ":1", 9)} ${pad(note, 22)} ${r.use}`
  );
}

if (failed > 0) {
  console.error(`\n  ${failed} contrast requirement(s) violated. Build stopped.\n`);
  process.exit(1);
}
console.log(`\n  ${results.length} pairs verified.\n`);

/* -------------------------------------------------------------------- build */

const tokensCss = readFileSync(TOKENS, "utf8");

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const fragments = readdirSync(SRC).filter((f) => f.endsWith(".html")).sort();
const manifest = [];

for (const file of fragments) {
  const raw = readFileSync(join(SRC, file), "utf8");

  const cardMatch = raw.match(/^<!--\s*@dsCard\s+([^>]*?)-->/);
  if (!cardMatch) {
    console.error(`  ${file} is missing its first-line @dsCard marker.`);
    process.exit(1);
  }
  const attrs = Object.fromEntries(
    [...cardMatch[1].matchAll(/(\w+)="([^"]*)"/g)].map(([, k, v]) => [k, v])
  );

  /*
   * Ratios are injected, never typed. A preview that quotes a contrast number must write
   * {{ratio:--al-fg|--al-bg}} so the figure is computed from tokens.css at build time and
   * cannot drift away from the palette it describes.
   */
  const body = raw
    .slice(cardMatch[0].length)
    .trim()
    .replace(/\{\{ratio:(--al-[\w-]+)\|(--al-[\w-]+)\}\}/g, (m, fgName, bgName) => {
      const fg = tokens[fgName];
      const bg = tokens[bgName];
      if (!fg || !bg) {
        console.error(`  ${file}: unknown token in ${m}`);
        process.exit(1);
      }
      return `${contrast(fg, bg).toFixed(2)}:1`;
    });
  const out = `${cardMatch[0]}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attrs.name ?? basename(file, ".html")} — Autolaw design system</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<style>
${tokensCss}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  padding: var(--al-space-6);
  background: var(--al-canvas);
  color: var(--al-ink);
  font-family: var(--al-font-ui);
  font-size: var(--al-text-body);
  line-height: var(--al-leading-normal);
  -webkit-font-smoothing: antialiased;
}
:focus-visible { outline: none; box-shadow: var(--al-focus-ring); border-radius: var(--al-radius-sm); }
.ds-shell { max-width: var(--al-max-width); margin: 0 auto; }
.ds-title { font-size: var(--al-text-xs); font-weight: var(--al-weight-bold); letter-spacing: var(--al-tracking-eyebrow); text-transform: uppercase; color: var(--al-ink-muted); margin: 0 0 var(--al-space-4); }
</style>
${body}
`;

  writeFileSync(join(DIST, file), out);
  manifest.push({ path: file, group: attrs.group, name: attrs.name });
  console.log(`  built  ${pad(file, 30)} [${attrs.group}]`);
}

writeFileSync(join(DIST, "_ds_manifest.json"), JSON.stringify({ cards: manifest }, null, 2));
console.log(`\n  ${fragments.length} previews → design-system/dist/\n`);
