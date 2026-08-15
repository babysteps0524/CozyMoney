import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DOMAIN = "https://cozymoney.kr";
const POSTS_DIR = path.resolve("src/data/posts");
const OUTPUT_FILE = path.resolve("public/sitemap.xml");

const BOARD_NAMES = [
  "stock",
  "realestate",
  "taxSaving",
  "insurance",
  "computertax",
];

async function getMarkdownFiles(directory) {
  const files = [];

  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

const urls = [
  { loc: `${DOMAIN}/`, priority: "1.0" },
  ...BOARD_NAMES.map((board) => ({
    loc: `${DOMAIN}/${board}/`,
    priority: "0.8",
  })),
  {
    loc: `${DOMAIN}/pages/privacy.html`,
    priority: "0.3",
  },
];

const markdownFiles = await getMarkdownFiles(POSTS_DIR);

for (const filePath of markdownFiles) {
  const relativePath = path.relative(POSTS_DIR, filePath);
  const parts = relativePath.split(path.sep);
  const board = parts[0];
  const postId = path.basename(filePath, ".md");

  if (!BOARD_NAMES.includes(board)) continue;

  urls.push({
    loc: `${DOMAIN}/${board}/${postId}/`,
    priority: "0.6",
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${loc}</loc>
    <priority>${priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
await writeFile(OUTPUT_FILE, xml, "utf-8");

console.log(`sitemap.xml 생성 완료: ${urls.length}개 URL`);
console.log(`게시글 ${markdownFiles.length}개 발견`);
