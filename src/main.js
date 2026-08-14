import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { initBoard } from "./board.js";

// ========================================
// 기본 요소
// ========================================

const pageContent = document.querySelector("#page-content");

// ========================================
// 메인 화면 저장
// ========================================

const homeContent = pageContent.innerHTML;

// ========================================
// 페이지 URL
// ========================================

function getPageUrl(href) {
  if (!href) {
    return "/";
  }

  if (href === "#") {
    return "/";
  }

  if (href.startsWith("./")) {
    return "/" + href.slice(2);
  }

  return href;
}

// ========================================
// HTML 페이지 가져오기
// ========================================

async function getPage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`페이지를 불러올 수 없습니다: ${url}`);
  }

  const html = await response.text();

  const parser = new DOMParser();

  const document = parser.parseFromString(html, "text/html");

  const newPageContent = document.querySelector("#page-content");

  if (!newPageContent) {
    throw new Error(`${url}에 #page-content가 없습니다.`);
  }

  return newPageContent.innerHTML;
}

// ========================================
// Home
// ========================================

function showHome() {
  pageContent.innerHTML = homeContent;

  history.pushState({ page: "home" }, "", "/");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ========================================
// 게시판
// ========================================

async function showPage(url) {
  try {
    const content = await getPage(url);

    pageContent.innerHTML = content;

    const boardMap = {
      "/pages/stock.html": "stock",

      "/pages/realestate.html": "realestate",

      "/pages/taxSaving.html": "taxSaving",

      "/pages/insurance.html": "insurance",

      "/pages/computertax.html": "computertax",
    };

    const board = boardMap[url];

    if (board) {
      await initBoard(board);
    }

    history.pushState({ url }, "", url);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
}

// ========================================
// SPA 링크
// ========================================

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-page]");

  if (!link) {
    return;
  }

  event.preventDefault();

  const page = link.dataset.page;

  if (page === "home") {
    showHome();

    return;
  }

  const href = link.getAttribute("href");

  const url = getPageUrl(href);

  showPage(url);
});

// ========================================
// 뒤로가기 / 앞으로가기
// ========================================

window.addEventListener("popstate", async () => {
  const path = window.location.pathname;

  // ====================================
  // Home
  // ====================================

  if (path === "/" || path === "/index.html") {
    pageContent.innerHTML = homeContent;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  // ====================================
  // 게시판
  // ====================================

  const boardMap = {
    "/pages/stock.html": "stock",

    "/pages/realestate.html": "realestate",

    "/pages/taxSaving.html": "taxSaving",

    "/pages/insurance.html": "insurance",

    "/pages/computertax.html": "computertax",
  };

  const board = boardMap[path];

  if (!board) {
    return;
  }

  try {
    const content = await getPage(path);

    pageContent.innerHTML = content;

    await initBoard(board);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(error);
  }
});
