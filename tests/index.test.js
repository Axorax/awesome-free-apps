const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  getLinks,
  mapWithConcurrency,
  testLinksReachable,
  testUrl,
} = require("../index.js");

test("getLinks extracts HTTP links without surrounding Markdown", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "afa-links-"));
  const file = path.join(directory, "README.md");
  fs.writeFileSync(
    file,
    [
      "[One](https://example.com/one)",
      "[Two](http://example.test/two)",
      "![Local](./logo.svg)",
    ].join("\n"),
  );

  try {
    assert.deepEqual(getLinks(file), [
      "https://example.com/one",
      "http://example.test/two",
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("testUrl follows redirects, rejects HTTP errors, and retries failed HEAD requests", async (t) => {
  const server = http.createServer((request, response) => {
    if (request.url === "/redirect") {
      response.writeHead(302, { location: "/ok" }).end();
    } else if (request.url === "/head-unsupported" && request.method === "HEAD") {
      response.writeHead(405).end();
    } else if (request.url === "/missing") {
      response.writeHead(404).end();
    } else {
      response.writeHead(200).end("ok");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  assert.deepEqual(await testUrl(`${baseUrl}/redirect`), {
    url: `${baseUrl}/redirect`,
    ok: true,
    status: 200,
  });
  assert.deepEqual(await testUrl(`${baseUrl}/head-unsupported`), {
    url: `${baseUrl}/head-unsupported`,
    ok: true,
    status: 200,
  });
  assert.deepEqual(await testUrl(`${baseUrl}/missing`), {
    url: `${baseUrl}/missing`,
    ok: false,
    status: 404,
  });
});

test("mapWithConcurrency never exceeds its worker limit", async () => {
  let active = 0;
  let maximum = 0;
  const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
    active += 1;
    maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 10));
    active -= 1;
    return value * 2;
  });

  assert.deepEqual(results, [2, 4, 6, 8, 10]);
  assert.equal(maximum, 2);
});

test("testLinksReachable deduplicates links and reports failures", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "afa-audit-"));
  const file = path.join(directory, "README.md");
  fs.writeFileSync(
    file,
    [
      "[One](https://example.com/ok)",
      "[Duplicate](https://example.com/ok)",
      "[Broken](https://example.com/missing)",
    ].join("\n"),
  );

  try {
    const report = await testLinksReachable(file, {
      concurrency: 1,
      testUrlImpl: async (url) => ({
        url,
        ok: !url.endsWith("/missing"),
        status: url.endsWith("/missing") ? 404 : 200,
      }),
    });

    assert.equal(report.total, 2);
    assert.deepEqual(report.failures, [
      { url: "https://example.com/missing", ok: false, status: 404 },
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
