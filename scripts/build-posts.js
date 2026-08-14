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
  latestPostsHtml = "",
}) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCategory = escapeHtml(category);
  const safeDate = escapeHtml(date);

  // 게시판 목록 페이지 주소
  const boardUrl = `/pages/${board}.html`;

  const canonicalUrl = `https://cozymoney.kr/${board}/${postId}/`;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} | COZYMONEY</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  <link rel="stylesheet" href="/assets/markdown.css">
</head>
<body>
  <!-- 왼쪽 광고 자리 -->
  <aside class="ad-left"></aside>

  <header class="site-header">
    <div class="site-header-inner">
      <a href="/" class="site-logo">
        <img src="/images/logo/cozymoney_01.svg" alt="COZYMONEY">
      </a>
    </div>
  </header>

  <nav class="site-nav">
    <ul>
      <li><a href="/">홈</a></li>
      <li><a href="/pages/stock.html">주식</a></li>
      <li><a href="/pages/realestate.html">부동산</a></li>
      <li><a href="/pages/taxSaving.html">세테크</a></li>
      <li><a href="/pages/insurance.html">보험</a></li>
      <li><a href="/pages/computertax.html">전산세무</a></li>
    </ul>
  </nav>

  <div class="page-wrapper">
    <main class="post-layout">
      <article class="markdown-body">
        <header class="post-header">
          <p class="post-category">${safeCategory}</p>
          <h1>${safeTitle}</h1>
          <time datetime="${safeDate}">${safeDate}</time>
        </header>

        <div class="post-content">
          ${contentHtml}
        </div>

        <div class="post-footer">
          <a href="${boardUrl}" class="post-back">
            ← ${safeCategory} 게시판으로 돌아가기
          </a>
        </div>
      </article>
    </main>

    <!-- 오른쪽 사이드바 -->
    <aside class="sidebar">
      <nav class="aside-nav">
        <h2 class="aside-nav-title">최신 글</h2>
        <ul class="latest-posts">
          ${latestPostsHtml}
        </ul>
      </nav>

      <!-- 오른쪽 광고 자리 -->
      <div class="ad-right">
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-format="rectangle"></ins>
      </div>
    </aside>
  </div>

  <footer class="site-footer">
    <p>© 2026 CozyMoney</p>
    <a href="/pages/privacy.html">개인정보처리방침</a>
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
// 먼저 모든 게시글 데이터 수집
// ========================================

const postsData = [];

for (const filePath of markdownFiles) {
  const markdown = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(markdown);

  const relativePath = path.relative(postsDir, filePath);
  const postPath = relativePath.replace(/\.md$/i, "");
  const pathParts = postPath.split(path.sep);
  const board = pathParts[0];
  const postId = path.basename(postPath);

  const title = data.title || "제목 없음";
  const description = data.description || "";
  const category = data.category || board;
  const date = formatDate(data.date);

  postsData.push({
    filePath,
    postPath,
    board,
    postId,
    title,
    description,
    category,
    date,
    content,
  });

  postList.push({
    id: postId,
    board,
    title,
    description,
    category,
    date,
    url: `/${board}/${postId}/`,
  });
}

// ========================================
// 최신 글 5개 HTML 만들기
// ========================================

const sortedForLatest = [...postList].sort((a, b) => {
  const dateCompare = new Date(b.date) - new Date(a.date);
  if (dateCompare !== 0) return dateCompare;
  return b.id.localeCompare(a.id, undefined, {
    numeric: true,
    sensitivity: "base",
  });
});

const latestPostsHtml = sortedForLatest
  .slice(0, 5)
  .map(
    (post) => `
      <li>
        <a href="${post.url}">${escapeHtml(post.title)}</a>
      </li>
    `,
  )
  .join("");

// ========================================
// 실제 HTML 파일 생성
// ========================================

for (const post of postsData) {
  const contentHtml = renderMarkdown(post.content);

  const outputPath = path.join(outputDir, post.postPath, "index.html");

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  });

  const finalHtml = createPostHtml({
    title: post.title,
    description: post.description,
    category: post.category,
    date: post.date,
    contentHtml,
    board: post.board,
    postId: post.postId,
    latestPostsHtml,
  });

  fs.writeFileSync(outputPath, finalHtml, "utf-8");

  console.log(`생성 완료: /${post.postPath}/`);
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
