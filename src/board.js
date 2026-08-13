import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";

// ========================================
// Markdown → HTML → KaTeX
// ========================================

function renderMarkdown(markdown) {
  const html = marked.parse(markdown);

  return html.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    return katex.renderToString(formula.trim(), {
      displayMode: true,
      throwOnError: false,
    });
  });
}

// ========================================
// 1. Markdown 파일 가져오기
// ========================================

const markdownFiles = import.meta.glob("./data/posts/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// ========================================
// 2. 게시판 설정
// ========================================

const postsPerPage = 15;

let currentPage = 1;
let currentBoard = "";

// ========================================
// 3. Markdown 분석
// ========================================

function parseMarkdown(markdown) {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

  // Front Matter가 없는 경우

  if (!match) {
    return {
      metadata: {},
      content: markdown,
    };
  }

  const frontMatter = match[1];
  const content = match[2];

  const metadata = {};

  frontMatter.split("\n").forEach((line) => {
    const index = line.indexOf(":");

    if (index === -1) {
      return;
    }

    const key = line.slice(0, index).trim();

    const value = line.slice(index + 1).trim();

    metadata[key] = value;
  });

  return {
    metadata,
    content,
  };
}

// ========================================
// 4. 모든 게시글 가져오기
// ========================================

function getPosts(board) {
  const posts = [];

  for (const [path, markdown] of Object.entries(markdownFiles)) {
    if (!path.includes(`/posts/${board}/`)) {
      continue;
    }

    const { metadata, content } = parseMarkdown(markdown);

    posts.push({
      path,

      title: metadata.title || "제목 없음",

      date: metadata.date || "",

      category: metadata.category || board,

      description: metadata.description || "",

      content,
    });
  }

  // 날짜 기준 최신순 정렬

  posts.sort((a, b) => {
    // 1순위: 날짜 최신순
    const dateCompare = new Date(b.date) - new Date(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    // 2순위: 게시글 번호 큰 순서
    const fileNameA = a.path.split("/").pop().replace(".md", "");
    const fileNameB = b.path.split("/").pop().replace(".md", "");

    return fileNameB.localeCompare(fileNameA, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return posts;
}

// ========================================
// 최신글 5개 가져오기
// ========================================

export function getLatestPosts(limit = 5) {
  const posts = [];

  for (const [path, markdown] of Object.entries(markdownFiles)) {
    const { metadata, content } = parseMarkdown(markdown);

    // 파일 경로에서 파일의 게시판 이름 가져오기
    // 예:
    // ./data/posts/stock/260812-1.md
    //                 ↓
    //               stock
    const pathParts = path.split("/");
    const boardIndex = pathParts.indexOf("posts");

    if (boardIndex === -1) {
      continue;
    }

    const board = pathParts[boardIndex + 1];

    posts.push({
      path,
      board,

      title: metadata.title || "제목 없음",

      date: metadata.date || "",

      category: metadata.category || board,

      description: metadata.description || "",

      content,
    });
  }

  // 날짜 최신순 정렬
  posts.sort((a, b) => {
    const dateCompare = new Date(b.date) - new Date(a.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    const fileNameA = a.path.split("/").pop().replace(".md", "");

    const fileNameB = b.path.split("/").pop().replace(".md", "");

    return fileNameB.localeCompare(fileNameA, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  return posts.slice(0, limit);
}

// ========================================
// 오른쪽 Aside 최신글 출력
// ========================================

export function renderLatestPosts() {
  const latestPosts = document.querySelector("#latestPosts");

  if (!latestPosts) {
    return;
  }

  const posts = getLatestPosts(5);

  latestPosts.innerHTML = posts
    .map((post) => {
      const postId = post.path.split("/").pop().replace(".md", "");

      return `
    <li mb="10px">
    <a
    href="/posts/${post.board}/${postId}"
    data-post-id="${postId}"
    data-board="${post.board}"
    text="14px #555"
    hover="text-[#9b8069]">
    ${post.title}
    </a>
    </li>
    `;
    })
    .join("");
}

// ========================================
// 5. 게시판 목록 출력
// ========================================

function renderPosts() {
  const postList = document.querySelector("#postList");

  const pagination = document.querySelector("#pagination");

  if (!postList || !pagination) {
    return;
  }

  const posts = getPosts(currentBoard);

  const startIndex = (currentPage - 1) * postsPerPage;

  const endIndex = startIndex + postsPerPage;

  const currentPosts = posts.slice(startIndex, endIndex);

  // ======================================
  // 게시글 목록
  // ======================================

  postList.innerHTML = currentPosts
    .map((post, index) => {
      const postId = post.path.split("/").pop().replace(".md", "");

      return `

        <article
        bg="[#F7F0EBFF] hover:[#f5dfd3ff]"
        shadow="md"
        border="1px solid [#F5DFD3FF]"
        rounded="12px"
        mb="12px"
        >
          <a
            href="/posts/${currentBoard}/${postId}"
            data-post-id="${postId}"
            data-board="${currentBoard}"
          >
            <h2
              text="18px"
              font="600"
              pt="8px"
              pl="12px"
            >
              ${post.title}
            </h2>
            <p
              text="14px #777"
              pl="12px"
            >
              ${post.description}
            </p>
            <p
              text="13px #999"
              pl="12px"
              pb="12px"
            >
              ${post.date}
            </p>
          </a>
        </article>

      `;
    })
    .join("");

  // 페이지네이션

  renderPagination(posts.length);
}

// ========================================
// 6. 페이지네이션
// ========================================

function renderPagination(totalPosts) {
  const pagination = document.querySelector("#pagination");

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // 이전 버튼

  const previousButton = document.createElement("button");

  previousButton.textContent = "‹";

  previousButton.className = "pageArrowBtn";

  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage === 1) {
      return;
    }

    currentPage--;

    renderPosts();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  pagination.appendChild(previousButton);

  // 페이지 번호

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.textContent = page;

    button.className = "pageBtn";

    // 현재 페이지
    if (page === currentPage) {
      button.className = "pageBtnActive";
    }

    button.addEventListener("click", () => {
      currentPage = page;

      renderPosts();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    pagination.appendChild(button);
  }

  // 다음 버튼

  const nextButton = document.createElement("button");

  nextButton.textContent = "›";

  nextButton.className = "pageArrowBtn";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage === totalPages) {
      return;
    }

    currentPage++;

    renderPosts();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  pagination.appendChild(nextButton);
}

// ========================================
// 7. 게시글 본문 표시
// ========================================

export function showPost(board, postId) {
  const pageContent = document.querySelector("#page-content");

  if (!pageContent) {
    return;
  }

  const posts = getPosts(board);

  // 게시글 번호로 게시글 찾기

  const post = posts.find((item) => {
    const id = item.path.split("/").pop().replace(".md", "");

    return id === postId;
  });

  // 게시글을 찾지 못한 경우

  if (!post) {
    pageContent.innerHTML = `
      <section p="20px">
        <h1 text="24px" font="600">
          게시글을 찾을 수 없습니다.
        </h1>
      </section>
    `;

    return;
  }

  // Markdown → HTML → kaTeX 수식 렌더링

  const html = renderMarkdown(post.content);

  // ======================================
  // 게시글 본문 출력
  // ======================================

  pageContent.innerHTML = `

    <article>
      <header mb="40px">
        <p
          text="14px #9b8069"
          font="600"
          mb="10px"
        >
          ${post.category}
        </p>
        <p
          text="14px #999"
          leading="1.4"
          mb="14px"
        >
          ${post.title}
        </p>
        <p
          text="14px #999"
        >
          ${post.date}
        </p>
      </header>
      <div
        prose
        max-w="none"
        mb="20px"
      >
        ${html}
      </div>
      <div mt="40px">
      <a
          inline-block
          rounded="4px"
          href="/pages/${board}.html"
          data-page="${board}"
          text="16px #777"
          p="8px"
          hover="bg-blue-300"
        >
          ← ${post.category} 게시판 목록으로 돌아가기
        </a>
        </div>
    </article>

  `;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ========================================
// 8. 게시글 제목 클릭 처리
// ========================================

document.addEventListener("click", (event) => {
  // 게시글 제목/링크인지 확인

  const postLink = event.target.closest("a[data-post-id]");

  if (!postLink) {
    return;
  }

  // 기본 링크 이동 막기

  event.preventDefault();

  const board = postLink.dataset.board;

  const postId = postLink.dataset.postId;

  // 주소창 변경

  history.pushState(
    {
      board,
      postId,
    },
    "",
    `/posts/${board}/${postId}`,
  );

  // 게시글 출력

  showPost(board, postId);
});

// ========================================
// 9. 게시판 초기화
// ========================================

export function initBoard(board) {
  currentBoard = board;

  currentPage = 1;

  renderPosts();
}

// ========================================
// 10. 게시글 주소 처리
// ========================================

export function handlePostRoute(path) {
  const match = path.match(/^\/posts\/([^/]+)\/([^/]+)$/);

  if (!match) {
    return false;
  }

  const board = match[1];
  const postId = match[2];

  showPost(board, postId);

  return true;
}
