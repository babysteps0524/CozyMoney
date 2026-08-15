import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import katex from "katex";

const ROOT_DIR = path.resolve(".");
const POSTS_DIR = path.resolve("src/data/posts");
const PUBLIC_DIR = path.resolve("public");

const BOARDS = {
  stock: {
    name: "주식",
    description: "주식 투자에 필요한 기본 지식부터 시장 이슈와 투자 상식까지",
  },
  realestate: {
    name: "부동산",
    description: "부동산 시장부터 청약과 세금까지 알아두면 좋은 부동산 정보",
  },
  taxSaving: {
    name: "세테크",
    description:
      "연말정산부터 다양한 절세 정보까지 세금을 이해하고 관리하는 방법",
  },
  insurance: {
    name: "보험",
    description: "보험료와 보장 내용을 쉽게 이해하기 위한 보험 정보",
  },
  computertax: {
    name: "전산세무",
    description: "전산세무 시험에 필요한 학습 자료와 기출문제 및 세무 정보",
  },
};

const DOMAIN = "https://cozymoney.kr";
const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";
const ADSENSE_SLOT = "XXXXXXXXXXXXXXXX";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

function formatDate(date) {
  if (!date) return "";

  if (date instanceof Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  return String(date).slice(0, 10);
}

function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function removeFirstH1(markdown) {
  return markdown.replace(/^\s*#\s+.+?\s*(?:\r?\n)+/, "");
}

function renderMarkdown(markdown) {
  let html = marked.parse(removeFirstH1(markdown));

  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) =>
    katex.renderToString(formula.trim(), {
      displayMode: true,
      throwOnError: false,
    }),
  );

  html = html.replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/g, (_, formula) =>
    katex.renderToString(formula.trim(), {
      displayMode: false,
      throwOnError: false,
    }),
  );

  return html;
}

function sortPosts(a, b) {
  const dateCompare = new Date(b.date) - new Date(a.date);
  if (dateCompare !== 0) return dateCompare;

  return b.id.localeCompare(a.id, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function collectPosts() {
  const posts = [];

  for (const filePath of getMarkdownFiles(POSTS_DIR)) {
    const markdown = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(markdown);

    const relativePath = path.relative(POSTS_DIR, filePath);
    const pathParts = relativePath.split(path.sep);
    const board = pathParts[0];
    const id = path.basename(filePath, path.extname(filePath));

    if (!BOARDS[board]) {
      console.warn(`알 수 없는 게시판을 건너뜁니다: ${board}/${id}`);
      continue;
    }

    const date = formatDate(data.date);

    posts.push({
      filePath,
      sourceDir: path.dirname(filePath),
      id,
      board,
      title: data.title || "제목 없음",
      description: data.description || "",
      category: data.category || BOARDS[board].name,
      date,
      content,
      url: `/${board}/${id}/`,
    });
  }

  return posts.sort(sortPosts);
}

function latestPostsHtml(posts, limit = 5) {
  return posts
    .slice(0, limit)
    .map(
      (post) => `
        <li mb="10px">
          <a href="${post.url}" text="14px #555" hover="text-[#9b8069]">
            ${escapeHtml(post.title)}
          </a>
        </li>`,
    )
    .join("\n");
}

function categoryPostsHtml(posts) {
  return posts
    .map(
      (post) => `
        <article
          bg="[#F7F0EBFF]"
          shadow="md"
          border="1px solid [#F5DFD3FF]"
          rounded="12px"
          mb="12px"
        >
          <a href="${post.url}" block p="16px">
            <h2 text="18px" font="600" mb="8px">
              ${escapeHtml(post.title)}
            </h2>
            <p text="14px #777" mb="8px">
              ${escapeHtml(post.description)}
            </p>
            <time datetime="${escapeAttribute(post.date)}" text="13px #999">
              ${escapeHtml(post.date)}
            </time>
          </a>
        </article>`,
    )
    .join("\n");
}

function navHtml() {
  return `
    <ul flex justify="center" border-y="2px solid #C76B08FF" pt="12px" pb="10px">
      ${Object.entries(BOARDS)
        .map(
          ([board, info]) => `
            <li mx="20px">
              <a href="/${board}/" class="navText">${info.name}</a>
            </li>`,
        )
        .join("")}
    </ul>`;
}

function footerHtml() {
  return `
    <footer bg="#523f2e" text="center #ffffff" py="20px 10px" px="20px">
      <div flex justify="center" items="center" gap="16px" mb="10px">
        <a href="/pages/privacy.html" text="14px #ffffff" hover="text-[#F5DFD3]">
          개인정보처리방침
        </a>
      </div>
      <p>
        <small>
          Copyright
          <i class="i-mdi-copyright text-16px"></i>
          2026.CozyMoney All rights reserved.
        </small>
      </p>
    </footer>`;
}

function adsenseScriptHtml() {
  return `
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}"
      crossorigin="anonymous"
    ></script>`;
}

function leftAdHtml() {
  return `
    <aside class="ad-left" aria-label="Google AdSense 광고 영역">
      <div class="ad-label">Google AdSense</div>
      <ins
        class="adsbygoogle"
        data-ad-client="${ADSENSE_CLIENT}"
        data-ad-slot="${ADSENSE_SLOT}"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </aside>`;
}

function rightAdHtml() {
  return `
    <div class="ad-right" aria-label="Google AdSense 광고 영역">
      <div class="ad-label">Google AdSense</div>
      <ins
        class="adsbygoogle"
        data-ad-client="${ADSENSE_CLIENT}"
        data-ad-slot="${ADSENSE_SLOT}"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>`;
}

function commonHead({ title, description, canonical, ogType = "website" }) {
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeAttribute(description)}" />
    <link rel="canonical" href="${escapeAttribute(canonical)}" />
    <meta property="og:title" content="${escapeAttribute(title)}" />
    <meta property="og:description" content="${escapeAttribute(description)}" />
    <meta property="og:type" content="${escapeAttribute(ogType)}" />
    <meta property="og:url" content="${escapeAttribute(canonical)}" />
    <title>${escapeHtml(title)}</title>`;
}

function createCategoryHtml({ board, posts, allPosts }) {
  const info = BOARDS[board];
  const title = `${info.name} | COZYMONEY`;
  const canonical = `${DOMAIN}/${board}/`;

  return `<!doctype html>
<html lang="ko">
  <head>
    ${commonHead({
      title,
      description: info.description,
      canonical,
    })}
    ${adsenseScriptHtml()}
    <script type="module" src="/src/main.js"></script>
  </head>
  <body
    bg="[url(/images/bg/bg-04.svg)]"
    class="bodyText"
    relative
    min-h="100vh"
    flex
    flex-col
  >
    ${leftAdHtml()}

    <header w="1240px" mx="auto">
      <h1 py="10px 16px">
        <a href="/">
          <img src="/images/logo/cozymoney_01.svg" alt="COZYMONEY" w="240px" h="auto" mx="auto" />
        </a>
      </h1>
    </header>

    <nav sticky top="0" z="100" mb="40px" bg="[url(/images/bg/bg-04.svg)]" w="1240px" mx="auto">
      ${navHtml()}
    </nav>

    <div
      w="full"
      max-w="1240px"
      mx="auto"
      px="16px"
      mb="40px"
      flex
      flex-col
      lg:flex-row
      gap="24px"
      flex-1
    >
      <main
        id="page-content"
        w="full"
        lg:flex-1
        bg="#ffffff"
        rounded="16px"
        py="24px"
        px="16px"
        md:px="32px"
        lg:px="72px"
        shadow="xl"
      >
        <section mb="40px">
          <p text="14px #9b8069" font="600" mb="10px">CozyMoney</p>
          <h1 text="32px" font="600" mb="14px">${info.name}</h1>
          <p text="16px #777" leading="7">${escapeHtml(info.description)}</p>
        </section>

        <section id="postList">
          ${categoryPostsHtml(posts)}
        </section>

        <nav id="pagination" flex justify-center items-center gap="8px" mt="40px" mb="60px"></nav>
      </main>

      <aside
        w="full"
        lg:basis="284px"
        lg:flex-shrink-0
        lg:sticky
        lg:top="100px"
        h="fit"
      >
        <nav class="asideNav" shadow="xl">
          <h2 class="asideNavH2">최신 글</h2>
          <ul id="latestPosts" list-none p="0" m="0">
            ${latestPostsHtml(allPosts)}
          </ul>
        </nav>
        ${rightAdHtml()}
      </aside>
    </div>

    ${footerHtml()}
  </body>
</html>
`;
}

function createPostHtml(post, allPosts) {
  const title = `${post.title} | COZYMONEY`;
  const canonical = `${DOMAIN}${post.url}`;
  const contentHtml = renderMarkdown(post.content);

  return `<!doctype html>
<html lang="ko">
  <head>
    ${commonHead({
      title,
      description: post.description,
      canonical,
      ogType: "article",
    })}
    <meta property="article:published_time" content="${escapeAttribute(post.date)}" />
    ${adsenseScriptHtml()}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.0/dist/katex.min.css" />
    <script type="module" src="/src/main.js"></script>
  </head>
  <body
    bg="[url(/images/bg/bg-04.svg)]"
    class="bodyText"
    relative
    min-h="100vh"
    flex
    flex-col
  >
    ${leftAdHtml()}

    <header w="1240px" mx="auto">
      <h1 py="10px 16px">
        <a href="/">
          <img src="/images/logo/cozymoney_01.svg" alt="COZYMONEY" w="240px" h="auto" mx="auto" />
        </a>
      </h1>
    </header>

    <nav sticky top="0" z="100" mb="40px" bg="[url(/images/bg/bg-04.svg)]" w="1240px" mx="auto">
      ${navHtml()}
    </nav>

    <div
      w="full"
      max-w="1240px"
      mx="auto"
      px="16px"
      mb="40px"
      flex
      flex-col
      lg:flex-row
      gap="24px"
      flex-1
    >
      <main
        id="page-content"
        class="post-page-content"
      >
        <article class="markdown-body">
          <header class="post-header">
            <p class="post-category">${escapeHtml(post.category)}</p>
            <h1>${escapeHtml(post.title)}</h1>
            <time datetime="${escapeAttribute(post.date)}">${escapeHtml(post.date)}</time>
          </header>

          <div class="post-content">
            ${contentHtml}
          </div>

          <div class="post-footer">
            <a href="/${post.board}/" class="post-back">
              ← ${escapeHtml(post.category)} 게시판으로 돌아가기
            </a>
          </div>
        </article>
      </main>

      <aside
        w="full"
        lg:basis="284px"
        lg:flex-shrink-0
        lg:sticky
        lg:top="100px"
        h="fit"
      >
        <nav class="asideNav" shadow="xl">
          <h2 class="asideNavH2">최신 글</h2>
          <ul id="latestPosts" list-none p="0" m="0">
            ${latestPostsHtml(allPosts)}
          </ul>
        </nav>
        ${rightAdHtml()}
      </aside>
    </div>

    ${footerHtml()}
  </body>
</html>
`;
}

function removeGeneratedBoardDirs() {
  for (const board of Object.keys(BOARDS)) {
    fs.rmSync(path.join(ROOT_DIR, board), {
      recursive: true,
      force: true,
    });

    fs.rmSync(path.join(PUBLIC_DIR, board), {
      recursive: true,
      force: true,
    });
  }
}

function removeGeneratedCategoryPages() {
  for (const board of Object.keys(BOARDS)) {
    fs.rmSync(path.join(ROOT_DIR, "pages", `${board}.html`), {
      force: true,
    });
  }
}

function writePostsJson(posts) {
  const dataDir = path.join(PUBLIC_DIR, "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const postList = posts.map(
    ({ id, board, title, description, category, date, url }) => ({
      id,
      board,
      title,
      description,
      category,
      date,
      url,
    }),
  );

  fs.writeFileSync(
    path.join(dataDir, "posts.json"),
    JSON.stringify(postList, null, 2),
    "utf-8",
  );
}

function copyPostAssets(post) {
  const entries = fs.readdirSync(post.sourceDir, { withFileTypes: true });
  const destinationDir = path.join(ROOT_DIR, post.board, post.id);

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name.toLowerCase().endsWith(".md")) continue;

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(
      path.join(post.sourceDir, entry.name),
      path.join(destinationDir, entry.name),
    );
  }
}

const posts = collectPosts();

removeGeneratedBoardDirs();
removeGeneratedCategoryPages();

for (const post of posts) {
  const outputDir = path.join(ROOT_DIR, post.board, post.id);
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "index.html"),
    createPostHtml(post, posts),
    "utf-8",
  );

  copyPostAssets(post);
}

for (const board of Object.keys(BOARDS)) {
  const boardPosts = posts
    .filter((post) => post.board === board)
    .sort(sortPosts);

  const outputDir = path.join(ROOT_DIR, board);
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "index.html"),
    createCategoryHtml({
      board,
      posts: boardPosts,
      allPosts: posts,
    }),
    "utf-8",
  );
}

writePostsJson(posts);

console.log(`Markdown 게시글 ${posts.length}개 발견`);
console.log(`게시글 HTML ${posts.length}개 생성 완료`);
console.log(`카테고리 HTML ${Object.keys(BOARDS).length}개 생성 완료`);
console.log(`posts.json 생성 완료`);
