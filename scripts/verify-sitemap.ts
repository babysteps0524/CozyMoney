import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const outputDirectory = join(process.cwd(), 'dist');
const sitemapIndexPath = join(outputDirectory, 'sitemap-index.xml');
const robotsPath = join(outputDirectory, 'robots.txt');
const redirectsPath = join(outputDirectory, '_redirects');
const expectedSitemapURL = 'https://cozymoney.kr/sitemap-index.xml';

async function assertFileExists(path: string, description: string) {
  try {
    await access(path);
  } catch {
    throw new Error(`Missing ${description}: ${path}`);
  }
}

function getSitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) =>
    match[1].trim(),
  );
}

await assertFileExists(sitemapIndexPath, 'sitemap index');
await assertFileExists(robotsPath, 'robots.txt');
await assertFileExists(redirectsPath, 'Cloudflare Pages redirects file');

const sitemapIndex = await readFile(sitemapIndexPath, 'utf8');
if (!sitemapIndex.includes('<sitemapindex')) {
  throw new Error(
    'sitemap-index.xml does not contain a sitemap index document.',
  );
}

const sitemapLocations = getSitemapLocations(sitemapIndex);
if (sitemapLocations.length === 0) {
  throw new Error('sitemap-index.xml does not reference any sitemap files.');
}

for (const location of sitemapLocations) {
  const sitemapURL = new URL(location);
  if (sitemapURL.origin !== 'https://cozymoney.kr') {
    throw new Error(`Unexpected sitemap origin: ${location}`);
  }

  const localPath = join(
    outputDirectory,
    decodeURIComponent(sitemapURL.pathname).replace(/^\/+/, ''),
  );
  await assertFileExists(
    localPath,
    `referenced sitemap file (${sitemapURL.pathname})`,
  );
}

const robots = await readFile(robotsPath, 'utf8');
if (!robots.includes(`Sitemap: ${expectedSitemapURL}`)) {
  throw new Error(`robots.txt must reference ${expectedSitemapURL}`);
}

const redirects = await readFile(redirectsPath, 'utf8');
if (!/^\/sitemap\.xml\s+\/sitemap-index\.xml\s+301\s*$/m.test(redirects)) {
  throw new Error(
    'Cloudflare Pages must redirect /sitemap.xml to /sitemap-index.xml with status 301.',
  );
}

console.info(
  `Sitemap verification passed: index, ${sitemapLocations.length} referenced sitemap(s), robots.txt, and legacy URL redirect.`,
);
