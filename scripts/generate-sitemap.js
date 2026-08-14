import { readdir, writeFile, mkdir } from "node:fs/promises";

import path from "node:path";

// ========================================
// 기본 설정
// ========================================

const DOMAIN = "https://cozymoney.kr";

const POSTS_DIR = path.resolve("src/data/posts");

const OUTPUT_FILE = path.resolve("public/sitemap.xml");

// ========================================
// 기본 페이지
// ========================================

const urls = [
  {
    loc: `${DOMAIN}/`,
    priority: "1.0",
  },

  {
    loc: `${DOMAIN}/pages/stock.html`,
    priority: "0.8",
  },

  {
    loc: `${DOMAIN}/pages/realestate.html`,
    priority: "0.8",
  },

  {
    loc: `${DOMAIN}/pages/taxSaving.html`,
    priority: "0.8",
  },

  {
    loc: `${DOMAIN}/pages/insurance.html`,
    priority: "0.8",
  },

  {
    loc: `${DOMAIN}/pages/computertax.html`,
    priority: "0.8",
  },

  {
    loc: `${DOMAIN}/pages/privacy.html`,
    priority: "0.3",
  },
];

// ========================================
// Markdown 파일 찾기
// ========================================

async function getMarkdownFiles(directory) {
  const files = [];

  let entries;

  try {
    entries = await readdir(directory, {
      withFileTypes: true,
    });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const childFiles = await getMarkdownFiles(fullPath);

      files.push(...childFiles);

      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// ========================================
// 게시글 URL 생성
// ========================================

const markdownFiles = await getMarkdownFiles(POSTS_DIR);

for (const filePath of markdownFiles) {
  const relativePath = path.relative(POSTS_DIR, filePath);

  const pathParts = relativePath.split(path.sep);

  const board = pathParts[0];

  const postId = path.basename(filePath, ".md");

  urls.push({
    loc: `${DOMAIN}/${board}/${postId}/`,

    priority: "0.6",
  });
}

// ========================================
// sitemap XML
// ========================================

const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}

</urlset>
`;

// ========================================
// public 폴더
// ========================================

await mkdir(path.dirname(OUTPUT_FILE), {
  recursive: true,
});

// ========================================
// 저장
// ========================================

await writeFile(OUTPUT_FILE, xml, "utf-8");

console.log(`sitemap.xml 생성 완료: ${urls.length}개 URL`);

console.log(`게시글 ${markdownFiles.length}개 발견`);
