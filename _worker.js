export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    // Canonical workflow command reference. Keep one real asset at /WCP.html
    // and route the friendly /WS/WCP variants to it.
    if (path === "/WS/WCP" || path === "/WS/WCP.html") {
      url.pathname = "/WCP.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    return env.ASSETS.fetch(request);
  }
};
