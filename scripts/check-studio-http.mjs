import assert from "node:assert/strict";
const origin = process.env.STUDIO_TEST_ORIGIN ?? "http://127.0.0.1:8787";
for (const segment of [
  "",
  "documents/",
  "inbox/",
  "profile/",
  "rules/",
  "connections/",
]) {
  const response = await fetch(`${origin}/application-studio/${segment}`);
  assert.equal(response.status, 200, `Studio page ${segment}`);
  const html = await response.text();
  assert.ok(html.includes("Public workspace preview."), "Sample disclosure");
  assert.ok(html.includes('aria-label="Application Studio"'), "Navigation");
  assert.ok(
    html.includes("Enable JavaScript to edit documents"),
    "Honest static fallback",
  );
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)) {
    assert.equal(
      (await fetch(`${origin}${match[1]}`)).status,
      200,
      `Asset ${match[1]}`,
    );
  }
}
const status = await fetch(`${origin}/api/studio/public/status`);
assert.equal(status.status, 200);
assert.equal((await status.json()).enabled, false, "Local AI must be disabled");
for (const path of ["profile", "connections", "gmail/send"]) {
  const result = await fetch(`${origin}/api/studio/private/${path}?mode=owner`);
  assert.equal(
    result.status,
    401,
    "Client flags must not unlock private endpoints",
  );
}
const generation = await fetch(`${origin}/api/studio/public/generate`, {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: "{}",
});
assert.equal(generation.status, 503, "Unconfigured AI must fail honestly");
assert.ok((await generation.json()).error.includes("not connected"));
const unknown = await fetch(`${origin}/api/studio/public/unknown`);
assert.equal(unknown.status, 404);
console.log(
  "Studio HTTP checks passed: six pages, built assets, backend status, private denials, disabled AI and unknown API route.",
);
