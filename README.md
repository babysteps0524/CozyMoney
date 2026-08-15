# CozyMoney

주식·부동산·세테크·보험·전산세무 정보를 제공하는 정적 HTML 기반 블로그입니다.

## 구조

- Markdown: `src/data/posts/`
- 정적 게시글/카테고리 HTML: `bun run build:posts`로 자동 생성
- 게시글 목록 데이터: `public/data/posts.json`
- sitemap: `public/sitemap.xml`
- SPA navigation: `src/main.js`

## 실행

```bash
bun install
bun run dev
```

## 배포용 빌드

```bash
bun run build
```

빌드하면 Markdown 게시글을 정적 HTML로 변환하고 카테고리 HTML, `posts.json`, `sitemap.xml`을 자동 생성한 뒤 Vite가 최종 `dist/`를 만듭니다.

`node_modules/`와 `dist/`는 Git에 커밋하지 않습니다.
