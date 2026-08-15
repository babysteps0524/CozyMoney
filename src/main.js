import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import "./assets/markdown.css";

import { initBoard, loadPosts } from "./board.js";

// ========================================
// DOM
// ========================================

const pageContent = document.querySelector("#page-content");

// ========================================
// 게시판 URL
// ========================================

const BOARD_MAP = {
  "/stock/": "stock",
  "/realestate/": "realestate",
  "/taxSaving/": "taxSaving",
  "/insurance/": "insurance",
  "/computertax/": "computertax",
};

// ========================================
// 상태
// ========================================

let allPostsLoaded = false;

let homeContent = null;
let homeDocument = null;

let navigationId = 0;

// ========================================
// URL 정규화
// ========================================

function normalizePath(pathname) {
  if (!pathname || pathname === "/index.html") {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname;
  }

  /*
    확장자가 없는 URL이면
    trailing slash를 붙인다.
  */

  if (!pathname.includes(".")) {
    return `${pathname}/`;
  }

  return pathname;
}

// ========================================
// 내부 SPA 링크인지 확인
// ========================================

function getSpaUrl(link) {
  if (!link) {
    return null;
  }

  const href = link.getAttribute("href");

  if (!href) {
    return null;
  }

  /*
    외부 프로토콜
  */

  if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(href)) {
    return null;
  }

  /*
    target="_blank"
  */

  if (link.target && link.target !== "_self") {
    return null;
  }

  /*
    다운로드 링크
  */

  if (link.hasAttribute("download")) {
    return null;
  }

  let url;

  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }

  /*
    외부 사이트
  */

  if (url.origin !== window.location.origin) {
    return null;
  }

  const pathname = url.pathname.toLowerCase();

  /*
    정적 리소스는 SPA 이동하지 않는다.
  */

  const excludedExtensions = [
    ".xml",
    ".txt",
    ".json",
    ".js",
    ".css",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".pdf",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
  ];

  if (excludedExtensions.some((extension) => pathname.endsWith(extension))) {
    return null;
  }

  return url;
}

// ========================================
// 정적 HTML 가져오기
// ========================================

async function fetchPageDocument(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/html",
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  const html = await response.text();

  const doc = new DOMParser().parseFromString(html, "text/html");

  return doc;
}

// ========================================
// HEAD 업데이트
// ========================================

function updateMeta(doc, selector, attribute, value) {
  const source = doc.querySelector(selector);

  let target = document.head.querySelector(selector);

  if (!source) {
    return;
  }

  if (!target) {
    target = document.createElement("meta");

    target.setAttribute(attribute, source.getAttribute(attribute));

    document.head.appendChild(target);
  }

  target.setAttribute("content", source.getAttribute("content") || "");
}

function updateHead(doc) {
  /*
    title
  */

  if (doc.title) {
    document.title = doc.title;
  }

  /*
    description
  */

  const sourceDescription = doc.querySelector('meta[name="description"]');

  let targetDescription = document.querySelector('meta[name="description"]');

  if (sourceDescription) {
    if (!targetDescription) {
      targetDescription = document.createElement("meta");

      targetDescription.name = "description";

      document.head.appendChild(targetDescription);
    }

    targetDescription.content = sourceDescription.content;
  }

  /*
    canonical
  */

  const sourceCanonical = doc.querySelector('link[rel="canonical"]');

  let targetCanonical = document.querySelector('link[rel="canonical"]');

  if (sourceCanonical) {
    if (!targetCanonical) {
      targetCanonical = document.createElement("link");

      targetCanonical.rel = "canonical";

      document.head.appendChild(targetCanonical);
    }

    targetCanonical.href = sourceCanonical.href;
  }

  /*
    Open Graph
  */

  updateMeta(doc, 'meta[property="og:title"]', "property");

  updateMeta(doc, 'meta[property="og:description"]', "property");

  updateMeta(doc, 'meta[property="og:type"]', "property");

  updateMeta(doc, 'meta[property="og:url"]', "property");

  updateMeta(doc, 'meta[property="article:published_time"]', "property");
}

// ========================================
// 게시글 데이터
// ========================================

async function ensurePostsLoaded() {
  if (allPostsLoaded) {
    return;
  }

  await loadPosts();

  allPostsLoaded = true;
}

// ========================================
// 현재 페이지 초기화
// ========================================

async function initializePage(pathname) {
  await ensurePostsLoaded();

  const board = BOARD_MAP[pathname];

  if (board) {
    await initBoard(board);
  }
}

// ========================================
// Home 캐시
// ========================================

async function prepareHomeCache() {
  if (homeContent !== null && homeDocument !== null) {
    return;
  }

  try {
    const doc = await fetchPageDocument("/");

    const content = doc.querySelector("#page-content");

    if (!content) {
      return;
    }

    homeContent = content.innerHTML;

    homeDocument = doc;
  } catch (error) {
    console.error("Home 캐시 생성 실패:", error);
  }
}

// ========================================
// AdSense
// ========================================

function refreshAds() {
  if (!window.adsbygoogle) {
    return;
  }

  document.querySelectorAll("ins.adsbygoogle").forEach((ad) => {
    /*
        이미 초기화된 광고는
        다시 push하지 않는다.
      */

    if (ad.getAttribute("data-adsbygoogle-status")) {
      return;
    }

    try {
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn("AdSense 초기화 실패:", error);
    }
  });
}

// ========================================
// 실제 SPA 페이지 렌더링
// ========================================

async function renderRoute(url, { scroll = true } = {}) {
  const currentNavigation = ++navigationId;

  const targetUrl = new URL(url, window.location.origin);

  const targetPath = normalizePath(targetUrl.pathname);

  /*
    Home
  */

  if (targetPath === "/" && homeContent !== null) {
    pageContent.innerHTML = homeContent;

    if (homeDocument) {
      updateHead(homeDocument);
    }

    await ensurePostsLoaded();

    if (currentNavigation !== navigationId) {
      return;
    }

    refreshAds();

    if (scroll) {
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }

    return;
  }

  /*
    정적 HTML 가져오기
  */

  const requestUrl = targetUrl.pathname + targetUrl.search;

  const doc = await fetchPageDocument(requestUrl);

  /*
    더 최신 navigation이 발생했다면
    이전 요청 결과를 무시한다.
  */

  if (currentNavigation !== navigationId) {
    return;
  }

  const nextContent = doc.querySelector("#page-content");

  if (!nextContent) {
    throw new Error(`#page-content를 찾을 수 없습니다: ${requestUrl}`);
  }

  /*
    Header / Navigation / Footer는
    절대 건드리지 않는다.
  */

  pageContent.innerHTML = nextContent.innerHTML;

  updateHead(doc);

  /*
    Home 캐시
  */

  if (targetPath === "/") {
    homeContent = nextContent.innerHTML;

    homeDocument = doc;
  }

  /*
    게시판 초기화
  */

  await initializePage(targetPath);

  if (currentNavigation !== navigationId) {
    return;
  }

  refreshAds();

  if (scroll) {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }
}

// ========================================
// SPA 이동
// ========================================

async function navigate(url, { push = true, scroll = true } = {}) {
  const targetUrl = new URL(url, window.location.origin);

  const targetPath = normalizePath(targetUrl.pathname);

  const currentPath = normalizePath(window.location.pathname);

  const targetFullUrl = targetUrl.pathname + targetUrl.search + targetUrl.hash;

  const currentFullUrl =
    window.location.pathname + window.location.search + window.location.hash;

  /*
    같은 URL이면 아무것도 하지 않는다.
  */

  if (targetFullUrl === currentFullUrl) {
    return;
  }

  /*
    ★ 가장 중요
    HTML을 가져오기 전에
    History를 먼저 변경한다.
  */

  if (push) {
    history.pushState(
      {
        path: targetPath,
      },
      "",
      targetFullUrl,
    );
  }

  try {
    await renderRoute(targetUrl.href, {
      scroll,
    });
  } catch (error) {
    console.error("SPA navigation 실패:", error);

    /*
      SPA 처리 실패 시
      방금 추가한 history를 제거한다.
    */

    if (push) {
      history.replaceState(
        {
          path: normalizePath(window.location.pathname),
        },
        "",
        window.location.href,
      );
    }

    /*
      실패한 경우에만
      일반 브라우저 이동
    */

    window.location.assign(targetUrl.href);
  }
}

// ========================================
// ★ 모든 내부 링크 클릭 처리
// ========================================
//
// capture phase(true)에서 실행한다.
//
// 브라우저가 링크를 실제로 이동시키기 전에
// preventDefault()를 먼저 실행한다.
// ========================================

document.addEventListener(
  "click",
  (event) => {
    /*
      마우스 왼쪽 버튼만
      SPA로 처리한다.
    */

    if (event.button !== 0) {
      return;
    }

    const link = event.target.closest("a");

    if (!link) {
      return;
    }

    const url = getSpaUrl(link);

    if (!url) {
      return;
    }

    /*
      같은 페이지의 #anchor는
      일반 anchor 동작을 허용한다.
    */

    const currentPath = normalizePath(window.location.pathname);

    const targetPath = normalizePath(url.pathname);

    if (currentPath === targetPath && url.hash) {
      return;
    }

    /*
      ====================================
      ★ 여기서 즉시 기본 브라우저 이동 차단
      ====================================
    */

    event.preventDefault();
    event.stopPropagation();

    /*
      SPA 이동
    */

    navigate(url.href, {
      push: true,
      scroll: true,
    });
  },
  true,
);

// ========================================
// 뒤로가기 / 앞으로가기
// ========================================

window.addEventListener("popstate", async () => {
  /*
      popstate에서는 절대로
      pushState를 다시 호출하지 않는다.
    */

  try {
    await renderRoute(window.location.href, {
      scroll: true,
    });
  } catch (error) {
    console.error("뒤로가기/앞으로가기 처리 실패:", error);

    /*
        SPA 처리 자체가 실패했을 때만
        현재 URL을 다시 요청한다.
      */

    window.location.reload();
  }
});

// ========================================
// 초기 실행
// ========================================

async function boot() {
  /*
    현재 URL을 첫 history 상태로 등록
  */

  history.replaceState(
    {
      path: normalizePath(window.location.pathname),
    },
    "",
    window.location.href,
  );

  /*
    게시글 데이터 로딩
  */

  try {
    await ensurePostsLoaded();
  } catch (error) {
    console.error("게시글 데이터 로딩 실패:", error);
  }

  const currentPath = normalizePath(window.location.pathname);

  /*
    현재가 Home
  */

  if (currentPath === "/") {
    homeContent = pageContent?.innerHTML ?? "";

    homeDocument = document;

    refreshAds();

    return;
  }

  /*
    현재가 게시판이면 초기화
  */

  const board = BOARD_MAP[currentPath];

  if (board) {
    await initBoard(board);
  }

  refreshAds();

  /*
    Home을 백그라운드에서 미리 캐시
  */

  prepareHomeCache();
}

// ========================================
// 시작
// ========================================

boot();
