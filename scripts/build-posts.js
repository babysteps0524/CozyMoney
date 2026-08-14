import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import katex from "katex";

// ========================================
// 기본 경로
// ========================================

const postsDir = path.resolve("src/data/posts");

const outputDir = path.resolve("public");

// ========================================
// 기존 게시글 HTML 삭제
// ========================================

const boards = ["stock", "realestate", "taxSaving", "insurance", "computertax"];

for (const board of boards) {
  const boardOutputDir = path.join(outputDir, board);

  fs.rmSync(boardOutputDir, {
    recursive: true,
    force: true,
  });
}

// ========================================
// Markdown 파일 찾기
// ========================================

function getMarkdownFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// ========================================
// 날짜를 YYYY-MM-DD로 변환
// ========================================

function formatDate(date) {
  if (!date) {
    return "";
  }

  if (date instanceof Date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(date).slice(0, 10);
}

// ========================================
// HTML 특수문자 처리
// ========================================

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ========================================
// 첫 번째 H1 제거
//
// Markdown 본문에
//
// # 주식은 무엇인가?
//
// 가 이미 있기 때문에
// HTML header의 제목과 중복되지 않도록 제거한다.
// ========================================

function removeFirstH1(markdown) {
  return markdown.replace(/^\s*#\s+.+?\s*(?:\r?\n)+/, "");
}

// ========================================
// Markdown → HTML
//
// 1. marked
// 2. KaTeX
// ========================================

function renderMarkdown(markdown) {
  const content = removeFirstH1(markdown);

  let html = marked.parse(content);

  // ======================================
  // $$ ... $$ 블록 수식
  // ======================================

  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    return katex.renderToString(formula.trim(), {
      displayMode: true,
      throwOnError: false,
    });
  });

  // ======================================
  // $ ... $ 인라인 수식
  // ======================================

  html = html.replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/g, (_, formula) => {
    return katex.renderToString(formula.trim(), {
      displayMode: false,
      throwOnError: false,
    });
  });

  return html;
}

// ========================================
// 게시글 공통 HTML
// ========================================

function createPostHtml({
  title,
  description,
  category,
  date,
  contentHtml,
  board,
  postId,
}) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCategory = escapeHtml(category);
  const safeDate = escapeHtml(date);

  const boardUrl = `/${board}/`;

  const canonicalUrl = `https://cozymoney.kr/${board}/${postId}/`;

  return `<!doctype html>
<html lang="ko">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${safeTitle} | COZYMONEY</title>

  <meta
    name="description"
    content="${safeDescription}"
  >

  <link
    rel="canonical"
    href="${canonicalUrl}"
  >

  <link
    rel="stylesheet"
    href="/assets/markdown.css"
  >

</head>

<body>

  <header class="site-header">

    <div class="site-header-inner">

      <a
        href="/"
        class="site-logo"
      >
        <img
          src="/images/logo/cozymoney_01.svg"
          alt="COZYMONEY"
        >
      </a>

    </div>

  </header>


  <nav class="site-nav">

    <ul>

      <li>
        <a href="/">홈</a>
      </li>

      <li>
        <a href="/pages/stock.html">주식</a>
      </li>

      <li>
        <a href="/pages/realestate.html">부동산</a>
      </li>

      <li>
        <a href="/pages/taxSaving.html">세테크</a>
      </li>

      <li>
        <a href="/pages/insurance.html">보험</a>
      </li>

      <li>
        <a href="/pages/computertax.html">전산세무</a>
      </li>

    </ul>

  </nav>


  <main class="post-layout">

    <article class="markdown-body">

      <header class="post-header">

        <p class="post-category">
          ${safeCategory}
        </p>

        <h1>
          ${safeTitle}
        </h1>

        <time datetime="${safeDate}">
          ${safeDate}
        </time>

      </header>


      <div class="post-content">

        ${contentHtml}

      </div>


      <div class="post-footer">

        <a
          href="${boardUrl}"
          class="post-back"
        >
          ← ${safeCategory} 게시판으로 돌아가기
        </a>

      </div>

    </article>

  </main>


  <footer class="site-footer">

    <p>
      © 2026 CozyMoney
    </p>

    <a href="/pages/privacy.html">
      개인정보처리방침
    </a>

  </footer>

</body>

</html>`;
}

// ========================================
// 게시글 생성
// ========================================

const markdownFiles = getMarkdownFiles(postsDir);

console.log(`Markdown 게시글 ${markdownFiles.length}개 발견`);

// ========================================
// 게시글 목록 데이터
// ========================================

const postList = [];

// ========================================
// 게시글 생성
// ========================================

for (const filePath of markdownFiles) {
  const markdown = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(markdown);

  // ======================================
  // 경로
  //
  // stock/260812-1.md
  // ======================================

  const relativePath = path.relative(postsDir, filePath);

  const postPath = relativePath.replace(/\.md$/i, "");

  // ======================================
  // board
  //
  // stock
  // ======================================

  const pathParts = postPath.split(path.sep);

  const board = pathParts[0];

  // ======================================
  // 게시글 ID
  //
  // 260812-1
  // ======================================

  const postId = path.basename(postPath);

  // ======================================
  // 데이터
  // ======================================

  const title = data.title || "제목 없음";

  const description = data.description || "";

  const category = data.category || board;

  const date = formatDate(data.date);

  // ======================================
  // 게시글 목록 데이터 추가
  // ======================================

  postList.push({
    id: postId,
    board,
    title,
    description,
    category,
    date,
    url: `/${board}/${postId}/`,
  });

  // ======================================
  // Markdown 렌더링
  // ======================================

  const contentHtml = renderMarkdown(content);

  // ======================================
  // 출력 경로
  //
  // public/stock/260812-1/index.html
  // ======================================

  const outputPath = path.join(outputDir, postPath, "index.html");

  // ======================================
  // 폴더 생성
  // ======================================

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  });

  // ======================================
  // HTML 생성
  // ======================================

  const finalHtml = createPostHtml({
    title,
    description,
    category,
    date,
    contentHtml,
    board,
    postId,
  });

  // ======================================
  // 파일 저장
  // ======================================

  fs.writeFileSync(outputPath, finalHtml, "utf-8");

  console.log(`생성 완료: /${postPath}/`);
}

// ========================================
// posts.json 생성
// ========================================

const postsJsonDir = path.join(outputDir, "data");

const postsJsonPath = path.join(postsJsonDir, "posts.json");

fs.mkdirSync(postsJsonDir, {
  recursive: true,
});

fs.writeFileSync(postsJsonPath, JSON.stringify(postList, null, 2), "utf-8");

console.log(`posts.json 생성 완료: ${postList.length}개`);

console.log("모든 게시글 HTML 생성 완료");
