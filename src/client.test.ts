import test from "node:test";
import assert from "node:assert";
import { formatEndpoint } from "./client.js";

test("formatEndpoint maps /api/v2/ to controller path by default", () => {
  const result = formatEndpoint("/api/v2/projects/");
  assert.strictEqual(result, "/api/controller/v2/projects/");
});

test("formatEndpoint preserves non-v2 endpoints", () => {
  const result = formatEndpoint("/api/v1/ping/");
  assert.strictEqual(result, "/api/v1/ping/");
});

test("formatEndpoint handles trailing slashes correctly", () => {
  // Temporarily override process.env to test prefix configurations
  const originalEnv = process.env.AAP_API_PREFIX;
  
  try {
    process.env.AAP_API_PREFIX = "/custom/prefix/";
    const result = formatEndpoint("/api/v2/jobs/");
    // Should preserve the custom prefix correctly
    assert.strictEqual(result, "/custom/prefix/jobs/");
  } finally {
    process.env.AAP_API_PREFIX = originalEnv;
  }
});
