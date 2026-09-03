// scripts/fetch-fonts.mjs — run once: node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const FACES = [
  { name: 'manrope-400', family: 'Manrope', css: 'family=Manrope:wght@400', weight: 400, style: 'normal' },
  { name: 'manrope-500', family: 'Manrope', css: 'family=Manrope:wght@500', weight: 500, style: 'normal' },
  { name: 'manrope-600', family: 'Manrope', css: 'family=Manrope:wght@600', weight: 600, style: 'normal' },
  { name: 'manrope-700', family: 'Manrope', css: 'family=Manrope:wght@700', weight: 700, style: 'normal' },
  { name: 'source-serif-4-400', family: 'Source Serif 4', css: 'family=Source+Serif+4:opsz,wght@8..60,400', weight: 400, style: 'normal' },
  { name: 'source-serif-4-600', family: 'Source Serif 4', css: 'family=Source+Serif+4:opsz,wght@8..60,600', weight: 600, style: 'normal' },
  { name: 'source-serif-4-400-italic', family: 'Source Serif 4', css: 'family=Source+Serif+4:ital,opsz,wght@1,8..60,400', weight: 400, style: 'italic' },
];
mkdirSync('public/fonts', { recursive: true });
for (const f of FACES) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${f.css}&display=swap`, { headers: { 'User-Agent': UA } })).text();
  // The latin block is the one whose comment reads "/* latin */"; take its url().
  const block = css.split('/* latin */').pop();
  const url = block?.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error(`no latin woff2 for ${f.name}`);
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`public/fonts/${f.name}.woff2`, bytes);
  console.log(`${f.name}.woff2 ${bytes.length} bytes`);
}
