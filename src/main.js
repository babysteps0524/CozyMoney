import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import { initBoard, handlePostRoute, renderLatestPosts } from "./board.js";

// ========================================
// 1. 기본 HTML 요소 찾기
// ========================================

const pageContent = document.querySelector("#page-content");

// ========================================
// 2. 처음 index.html에 있던 메인 화면 기억
// ========================================

const homeContent = pageContent.innerHTML;

// ========================================
// 2-1. 오른쪽 Aside 최신글 출력
// ========================================
renderLatestPosts();

// ========================================
// 3. 페이지 주소를 안전하게 만드는 함수
// ========================================

function getPageUrl(href) {
  // href가 없으면 종료
  if (!href) {
    return "/";
  }

  // "#"이면 메인 페이지
  if (href === "#") {
    return "/";
  }

  // "./pages/stock.html"
  //      ↓
  // "/pages/stock.html"
  if (href.startsWith("./")) {
    return "/" + href.slice(2);
  }

  return href;
}

// ========================================
// 4. HTML 페이지 가져오기
// ========================================

async function getPage(url) {
  const response = await fetch(url);

  // 페이지를 가져오지 못한 경우
  if (!response.ok) {
    throw new Error(`페이지를 불러올 수 없습니다: ${url}`);
  }

  // HTML을 문자열로 가져오기
  const html = await response.text();

  // HTML 문자열을 실제 문서처럼 분석
  const parser = new DOMParser();

  const document = parser.parseFromString(html, "text/html");

  // 가져온 HTML에서 page-content 찾기
  const newPageContent = document.querySelector("#page-content");

  // page-content가 없으면 오류
  if (!newPageContent) {
    throw new Error(`${url}에 #page-content가 없습니다.`);
  }

  return newPageContent.innerHTML;
}

// ========================================
// 5. 메인 페이지 표시
// ========================================

function showHome() {
  // 메인 내용으로 변경
  pageContent.innerHTML = homeContent;

  // 주소창 변경
  history.pushState({ page: "home" }, "", "/");

  // 페이지 맨 위로 이동
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ========================================
// 6. 다른 페이지 표시
// ========================================

async function showPage(url) {
  try {
    // 해당 HTML 파일 가져오기
    const content = await getPage(url);

    // 현재 main 내용만 변경
    pageContent.innerHTML = content;

    if (url === "/pages/stock.html") {
      initBoard("stock");
    }

    if (url === "/pages/realestate.html") {
      initBoard("realestate");
    }

    if (url === "/pages/insurance.html") {
      initBoard("insurance");
    }

    if (url === "/pages/taxSaving.html") {
      initBoard("taxSaving");
    }

    if (url === "/pages/computertax.html") {
      initBoard("computertax");
    }

    // 주소창 변경
    history.pushState({ url: url }, "", url);

    // 페이지 맨 위로 이동
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
}

// ========================================
// 7. data-page가 있는 링크 클릭 처리
// ========================================

document.addEventListener("click", (event) => {
  // 클릭한 요소에서 가장 가까운 <a> 찾기
  const link = event.target.closest("a[data-page]");

  // data-page가 있는 링크가 아니면 아무것도 하지 않음
  if (!link) {
    return;
  }

  // 기본 링크 이동 막기
  event.preventDefault();

  // data-page 가져오기
  const page = link.dataset.page;

  // ======================================
  // 로고 또는 home
  // ======================================

  if (page === "home") {
    showHome();

    return;
  }

  // ======================================
  // 다른 카테고리
  // ======================================

  const href = link.getAttribute("href");

  const url = getPageUrl(href);

  showPage(url);
});

// ========================================
// 8. 브라우저 뒤로가기 / 앞으로가기
// ========================================

window.addEventListener("popstate", async () => {
  const path = window.location.pathname;

  // ====================================
  // 게시글 상세 페이지
  // ====================================

  if (path.startsWith("/posts/")) {
    handlePostRoute(path);

    return;
  }

  // ----------------------------------------
  // 메인 페이지
  // ----------------------------------------

  if (path === "/" || path === "/index.html") {
    pageContent.innerHTML = homeContent;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  // ----------------------------------------
  // 게시판 페이지
  // ----------------------------------------

  try {
    const content = await getPage(path);

    pageContent.innerHTML = content;

    if (path === "/pages/stock.html") {
      initBoard("stock");
    } else if (path === "/pages/realestate.html") {
      initBoard("realestate");
    } else if (path === "/pages/insurance.html") {
      initBoard("insurance");
    } else if (path === "/pages/taxSaving.html") {
      initBoard("taxSaving");
    } else if (path === "/pages/computertax.html") {
      initBoard("computertax");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
});
