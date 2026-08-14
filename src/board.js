// ========================================
// 게시판
// ========================================

const postsPerPage = 15;

let allPosts = [];
let currentPage = 1;
let currentBoard = "";
let postsLoaded = false;

// ========================================
// 게시글 데이터 가져오기 (한 번만)
// ========================================

export async function loadPosts() {
  if (postsLoaded && allPosts.length > 0) {
    renderLatestPosts();
    return allPosts;
  }

  const response = await fetch("/data/posts.json");

  if (!response.ok) {
    throw new Error("게시글 데이터를 불러올 수 없습니다.");
  }

  allPosts = await response.json();
  postsLoaded = true;

  renderLatestPosts();

  return allPosts;
}

// ========================================
// 게시판 게시글 가져오기
// ========================================

function getPosts(board) {
  return allPosts
    .filter((post) => post.board === board)
    .sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.id.localeCompare(a.id, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
}

// ========================================
// 최신글
// ========================================

export function getLatestPosts(limit = 5) {
  return [...allPosts]
    .sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.id.localeCompare(a.id, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    })
    .slice(0, limit);
}

// ========================================
// 최신글 출력
// ========================================

export function renderLatestPosts() {
  const latestPosts = document.querySelector("#latestPosts");

  if (!latestPosts) {
    return;
  }

  const posts = getLatestPosts(5);

  latestPosts.innerHTML = posts
    .map(
      (post) => `
        <li mb="10px">
          <a
            href="${post.url}"
            text="14px #555"
            hover="text-[#9b8069]"
          >
            ${post.title}
          </a>
        </li>
      `,
    )
    .join("");
}

// ========================================
// 게시글 목록 출력
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

  postList.innerHTML = currentPosts
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
              ${post.title}
            </h2>
            <p text="14px #777" mb="8px">
              ${post.description}
            </p>
            <p text="13px #999">
              ${post.date}
            </p>
          </a>
        </article>
      `,
    )
    .join("");

  renderPagination(posts.length);
}

// ========================================
// 페이지네이션
// ========================================

function renderPagination(totalPosts) {
  const pagination = document.querySelector("#pagination");
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const previousButton = document.createElement("button");
  previousButton.textContent = "‹";
  previousButton.className = "pageArrowBtn";
  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage === 1) return;
    currentPage--;
    renderPosts();
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  pagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");
    button.textContent = page;
    button.className = page === currentPage ? "pageBtnActive" : "pageBtn";

    button.addEventListener("click", () => {
      currentPage = page;
      renderPosts();
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    pagination.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.className = "pageArrowBtn";
  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage === totalPages) return;
    currentPage++;
    renderPosts();
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  pagination.appendChild(nextButton);
}

// ========================================
// 게시판 초기화
// ========================================

export async function initBoard(board) {
  currentBoard = board;
  currentPage = 1;

  try {
    await loadPosts();
    renderPosts();
  } catch (error) {
    console.error(error);

    const postList = document.querySelector("#postList");

    if (postList) {
      postList.innerHTML = `
        <p text="14px #999">
          게시글을 불러오지 못했습니다.
        </p>
      `;
    }
  }
}
