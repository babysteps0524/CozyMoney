import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { initBoard, loadPosts } from "./board.js";

// ========================================
// 기본 요소
// ========================================

const pageContent = document.querySelector("#page-content");

// 홈 내용은 "진짜 홈"일 때만 저장
let homeContent = "";

const boardMap = {
  "/pages/stock.html": "stock",
  "/pages/realestate.html": "realestate",
  "/pages/taxSaving.html": "taxSaving",
  "/pages/insurance.html": "insurance",
  "/pages/computertax.html": "computertax",
};

// ========================================
// 페이지 URL 정리
// ========================================

function getPageUrl(href) {
  if (!href || href === "#") return "/";

  if (href.startsWith("./")) {
    return "/" + href.slice(2);
  }

  return href;
}

// ========================================
// HTML에서 #page-content만 가져오기
// ========================================

async function getPage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`페이지를 불러올 수 없습니다: ${url}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const newPageContent = doc.querySelector("#page-content");

  if (!newPageContent) {
    throw new Error(`${url}에 #page-content가 없습니다.`);
  }

  return newPageContent.innerHTML;
}

// ========================================
// 스크롤 (흔들림 줄이기)
// ========================================

function scrollTopSmooth() {
  // smooth 대신 instant로 해서 흔들림 줄임
  window.scrollTo({ top: 0, behavior: "instant" });
}

// ========================================
// Home
// ========================================

function showHome() {
  if (!homeContent) return;

  pageContent.innerHTML = homeContent;
  history.pushState({ page: "home" }, "", "/");
  document.title = "CozyMoney";
  scrollTopSmooth();
}

// ========================================
// 게시판
// ========================================

async function showPage(url) {
  try {
    const content = await getPage(url);
    pageContent.innerHTML = content;

    const board = boardMap[url];

    if (board) {
      await initBoard(board);

      const titles = {
        stock: "주식 | COZYMONEY",
        realestate: "부동산 | COZYMONEY",
        taxSaving: "세테크 | COZYMONEY",
        insurance: "보험 | COZYMONEY",
        computertax: "전산세무 | COZYMONEY",
      };

      document.title = titles[board] || "COZYMONEY";
    }

    history.pushState({ url }, "", url);
    scrollTopSmooth();
  } catch (error) {
    console.error(error);
  }
}

// ========================================
// SPA 링크 클릭
// ========================================

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-page]");

  if (!link) return;

  event.preventDefault();

  const page = link.dataset.page;

  if (page === "home") {
    showHome();
    return;
  }

  const href = link.getAttribute("href");
  const url = getPageUrl(href);

  // 이미 같은 페이지면 무시
  if (window.location.pathname === url) return;

  showPage(url);
});

// ========================================
// 뒤로가기 / 앞으로가기
// ========================================

window.addEventListener("popstate", async () => {
  const path = window.location.pathname;

  if (path === "/" || path === "/index.html") {
    showHome();
    return;
  }

  const board = boardMap[path];

  if (!board) return;

  try {
    const content = await getPage(path);
    pageContent.innerHTML = content;
    await initBoard(board);
    scrollTopSmooth();
  } catch (error) {
    console.error(error);
  }
});

// ========================================
// 처음 페이지 열렸을 때
// ========================================

async function boot() {
  const path = window.location.pathname;

  // 스크롤바 때문에 화면 너비가 흔들리는 것 방지
  document.documentElement.style.overflowY = "scroll";

  // 최신 글은 항상 미리 로드
  try {
    await loadPosts();
  } catch (e) {
    console.error(e);
  }

  // 홈에서 시작한 경우만 홈 내용 저장
  if (path === "/" || path === "/index.html" || path === "") {
    homeContent = pageContent.innerHTML;
    return;
  }

  // 게시판 페이지로 직접 들어온 경우
  const board = boardMap[path];

  if (board) {
    await initBoard(board);
  }
}

boot();
