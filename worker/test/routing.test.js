import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import worker from "../src/index.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

async function routedUrl(path) {
  let target;
  globalThis.fetch = async request => {
    target = request.url;
    return new Response("ok", { headers: { "content-type": "text/plain" } });
  };

  await worker.fetch(new Request(`https://tagims.com${path}`), {});
  return target;
}

test("routes the main website homepage through the Pages origin", async () => {
  assert.equal(await routedUrl("/"), "https://tagims-site-production.pages.dev/");
});

test("routes only the Hub design sandbox and its assets to Pages", async () => {
  for (const path of ["/dev/hubbahub", "/dev/hubbahub/", "/dev/hubbahub/hub-runtime.html", "/dev/hubbahub/site.css?v=1"]) {
    assert.equal(await routedUrl(path), `https://tagims-site-production.pages.dev${path}`);
  }
  assert.equal(await routedUrl("/dev/hubbahub-other"), "https://app.tagims.com/dev/hubbahub-other");
});

test("routes /apps/tagim through the Pages origin", async () => {
  assert.equal(
    await routedUrl("/apps/tagim"),
    "https://tagims-site-production.pages.dev/apps/tagim"
  );
});

test("routes /apps/tagim/ through the Pages origin", async () => {
  assert.equal(
    await routedUrl("/apps/tagim/"),
    "https://tagims-site-production.pages.dev/apps/tagim/"
  );
});

test("routes /apps/hubbahub through the Pages origin", async () => {
  assert.equal(
    await routedUrl("/apps/hubbahub"),
    "https://tagims-site-production.pages.dev/apps/hubbahub"
  );
});

test("routes /apps/hubbahub/ through the Pages origin", async () => {
  assert.equal(
    await routedUrl("/apps/hubbahub/"),
    "https://tagims-site-production.pages.dev/apps/hubbahub/"
  );
});

test("proxies application paths through app.tagims.com", async () => {
  assert.equal(
    await routedUrl("/api/status?detail=full"),
    "https://app.tagims.com/api/status?detail=full"
  );
});

test("preserves existing audit and auto-loan website routing", async () => {
  assert.equal(
    await routedUrl("/audit/"),
    "https://tagims-site-production.pages.dev/audit/"
  );
  assert.equal(
    await routedUrl("/apps/autoloan/"),
    "https://tagims-site-production.pages.dev/apps/autoloan/"
  );
});


test("routes aquarium page and assets to Pages without capturing other apps", async () => {
  for (const path of ["/apps/tank", "/apps/tank/", "/apps/tank/assets/fish-0.png", "/apps/tank/static/a.js?v=1"]) {
    assert.equal(await routedUrl(path), `https://tagims-site-production.pages.dev${path}`);
  }
  assert.equal(await routedUrl("/apps/tank-other"), "https://app.tagims.com/apps/tank-other");
});

test("routes estimates pages and assets to Pages without capturing other apps", async () => {
  for (const path of ["/apps/estimates", "/apps/estimates/", "/apps/estimates/index.html", "/apps/estimates/assets/app.js?v=1"]) {
    assert.equal(await routedUrl(path), `https://tagims-site-production.pages.dev${path}`);
  }
  assert.equal(await routedUrl("/apps/estimates-other"), "https://app.tagims.com/apps/estimates-other");
});
