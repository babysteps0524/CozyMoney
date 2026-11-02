Bun.serve({
  hostname: '127.0.0.1',
  port: 8789,
  async fetch(req) {
    const url = new URL(req.url);
    const path =
      url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = Bun.file('./dist' + path);
    return (await file.exists())
      ? new Response(file)
      : new Response('Not Found', { status: 404 });
  },
});
console.log('Static test server ready on http://127.0.0.1:8789');
