// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { NIGHTLY_SETTING_UNREADABLE_MESSAGE } from "../constants.js";
import type { HttpFetch } from "../types.js";
import { readNightlySetting } from "./read-nightly-setting.js";

const SERVER_URL = "http://server.internal:3000";
const API_TOKEN = "updater-test-token-value";
const NIGHTLY_URL = "http://server.internal:3000/api/system/updater/nightly";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const fetchReplying =
  (reply: () => Response | Promise<Response>): HttpFetch =>
  async () =>
    reply();

const readWith = (httpFetch: HttpFetch) => readNightlySetting(SERVER_URL, API_TOKEN, httpFetch);

const expectUnreadable = async (promise: Promise<unknown>): Promise<void> => {
  const error = await promise.then(
    () => null,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(NIGHTLY_SETTING_UNREADABLE_MESSAGE);
  expect((error as Error).message).not.toContain(API_TOKEN);
  expect((error as Error).message).not.toContain("server.internal");
};

describe("readNightlySetting", () => {
  it("sends the bearer token to the internal nightly route without following redirects", async () => {
    let captured: { url: string; init: RequestInit } | undefined;
    await readWith(async (url, init) => {
      captured = { url, init };
      return jsonResponse({ enabled: true });
    });

    expect(captured?.url).toBe(NIGHTLY_URL);
    expect(captured?.init.method).toBe("GET");
    expect(captured?.init.redirect).toBe("error");
    expect(new Headers(captured?.init.headers).get("authorization")).toBe(`Bearer ${API_TOKEN}`);
  });

  it.each([true, false])("returns the stored setting %s", async (enabled) => {
    await expect(readWith(fetchReplying(() => jsonResponse({ enabled })))).resolves.toBe(enabled);
  });

  it.each([
    ["a body that is not JSON", () => new Response("not json", { status: 200 })],
    ["a non-boolean enabled value", () => jsonResponse({ enabled: "yes" })],
    ["an extra key", () => jsonResponse({ enabled: true, hour: 3 })],
    ["a missing enabled key", () => jsonResponse({})],
    ["a 401 answer", () => jsonResponse({ code: "UNAUTHENTICATED" }, 401)],
    ["a 503 answer", () => jsonResponse({ code: "UPDATER_UNAVAILABLE" }, 503)],
  ])("rejects %s with a fixed message", async (_label, reply) => {
    await expectUnreadable(readWith(fetchReplying(reply)));
  });

  it("rejects a network failure with a fixed message and no URL or token text", async () => {
    await expectUnreadable(
      readWith(async () => {
        throw new TypeError(`fetch failed for ${NIGHTLY_URL} with ${API_TOKEN}`);
      }),
    );
  });

  it("rejects a redirect, which the fetch refuses by erroring", async () => {
    await expectUnreadable(
      readWith(async (_url, init) => {
        if (init.redirect === "error") {
          throw new TypeError("redirect not followed");
        }
        return new Response(null, { status: 302, headers: { location: "https://elsewhere" } });
      }),
    );
  });

  it("passes an abort signal so that a slow server cannot hold the run", async () => {
    let signal: AbortSignal | undefined;
    await readWith(async (_url, init) => {
      signal = init.signal ?? undefined;
      return jsonResponse({ enabled: false });
    });

    expect(signal).toBeDefined();
    expect(signal?.aborted).toBe(false);
  });
});
