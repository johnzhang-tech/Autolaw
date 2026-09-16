import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROUTED_FEATURES } from '../../../data/product';

const ROOT = process.cwd();
const slugs = ROUTED_FEATURES.map((feature) => feature.slug!);

describe('product page routes', () => {
  it('builds and publishes exactly the routed feature slugs', () => {
    const vite = readFileSync(join(ROOT, 'vite.config.ts'), 'utf8');
    const sitemap = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf8');

    const built = [...vite.matchAll(/product\/([^/'"]+)\/index\.html/g)]
      .map((match) => match[1]);
    const published = [...sitemap.matchAll(/autolaw\.ai\/product\/([^/]+)\//g)]
      .map((match) => match[1]);

    expect(new Set(built)).toEqual(new Set(slugs));
    expect(new Set(published)).toEqual(new Set(slugs));
  });

  it.each(ROUTED_FEATURES)('ships $name with unique metadata and the shared page component', (feature) => {
    const directory = join(ROOT, 'product', feature.slug!);
    const htmlPath = join(directory, 'index.html');
    const entryPath = join(directory, 'main.tsx');

    expect(existsSync(htmlPath), htmlPath).toBe(true);
    expect(existsSync(entryPath), entryPath).toBe(true);

    const html = readFileSync(htmlPath, 'utf8');
    const entry = readFileSync(entryPath, 'utf8');
    const canonical = `https://www.autolaw.ai/product/${feature.slug}/`;

    expect(html).toContain(`<title>${feature.page!.meta.title}</title>`);
    expect(html).toContain(`content="${feature.page!.meta.description}"`);
    expect(html).toContain(`href="${canonical}"`);
    expect(html).toContain(`content="${canonical}"`);
    expect(entry).toContain(`id="${feature.id}"`);
    expect(entry).toContain('FeaturePage');
  });
});
