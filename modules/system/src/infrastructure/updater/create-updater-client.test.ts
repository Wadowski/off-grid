// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { CurrentVersionUnknownError } from "../../application/errors/current-version-unknown-error.js";
import { UpdateAlreadyRunningError } from "../../application/errors/update-already-running-error.js";
import { UpdaterFailedError } from "../../application/errors/updater-failed-error.js";
import { UpdaterUnavailableError } from "../../application/errors/updater-unavailable-error.js";
import type { Fetcher, UpdaterSettings } from "../../types.js";
import { createUpdaterClient } from "./create-updater-client.js";

const settings: UpdaterSettings = { url: "http://updater:3100", token: "secret-token-value" };

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const fetchAnswering = (status: number, body: unknown): Fetcher =>
  (async () => jsonResponse(status, body)) as Fetcher;

const fetchFailing = (error: Error): Fetcher =>
  (async () => {
    throw error;
  }) as Fetcher;

const captureFetch = (
  body: unknown,
): { fetcher: Fetcher; requests: { url: string; init: RequestInit }[] } => {
  const requests: { url: string; init: RequestInit }[] = [];
  const fetcher = (async (url: URL, init: RequestInit) => {
    requests.push({ url: url.toString(), init });
    return jsonResponse(200, body);
  }) as Fetcher;
  return { fetcher, requests };
};

const statusBody = { update: null, running: false };

const checkBody = {
  currentVersion: "1.0.0",
  latestVersion: "1.1.0",
  updateAvailable: true,
  updateAllowed: true,
};

const errorOf = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the call to reject");
};

describe("createUpdaterClient", () => {
  it("sends the bearer token to the updater status path", async () => {
    const { fetcher, requests } = captureFetch(statusBody);

    await createUpdaterClient(settings, fetcher).readStatus();

    expect(requests[0]?.url).toBe("http://updater:3100/status");
    expect(requests[0]?.init.method).toBe("GET");
    expect(new Headers(requests[0]?.init.headers).get("authorization")).toBe(
      "Bearer secret-token-value",
    );
  });

  it("parses the status reply", async () => {
    const client = createUpdaterClient(settings, fetchAnswering(200, statusBody));

    expect(await client.readStatus()).toStrictEqual({ update: null, running: false });
  });

  it("posts the requested version to apply and parses the accepted reply", async () => {
    const { fetcher, requests } = captureFetch({ started: true, targetVersion: "1.1.0" });

    const result = await createUpdaterClient(settings, fetcher).applyUpdate("1.1.0");

    expect(requests[0]?.url).toBe("http://updater:3100/apply");
    expect(requests[0]?.init.body).toBe(JSON.stringify({ version: "1.1.0" }));
    expect(result).toStrictEqual({ started: true, targetVersion: "1.1.0" });
  });

  it("parses the check reply", async () => {
    const client = createUpdaterClient(settings, fetchAnswering(200, checkBody));

    expect(await client.checkForUpdate()).toStrictEqual(checkBody);
  });

  it("rejects a reply that does not match the expected shape as UPDATER_ERROR", async () => {
    const client = createUpdaterClient(settings, fetchAnswering(200, { unexpected: true }));

    const error = await errorOf(client.checkForUpdate());

    expect(error).toBeInstanceOf(UpdaterFailedError);
    expect((error as UpdaterFailedError).code).toBe("UPDATER_ERROR");
  });

  it("treats a body that is not JSON as UPDATER_ERROR", async () => {
    const fetcher = (async () => new Response("<html>", { status: 200 })) as Fetcher;

    const error = await errorOf(createUpdaterClient(settings, fetcher).readStatus());

    expect((error as UpdaterFailedError).code).toBe("UPDATER_ERROR");
  });

  it("treats a timeout as the updater being unavailable", async () => {
    const client = createUpdaterClient(
      settings,
      fetchFailing(new DOMException("timed out", "TimeoutError")),
    );

    expect(await errorOf(client.readStatus())).toBeInstanceOf(UpdaterUnavailableError);
  });

  it("treats a refused connection as the updater being unavailable", async () => {
    const client = createUpdaterClient(settings, fetchFailing(new TypeError("fetch failed")));

    expect(await errorOf(client.checkForUpdate())).toBeInstanceOf(UpdaterUnavailableError);
  });

  it("answers unavailable without calling the updater when none is configured", async () => {
    const { fetcher, requests } = captureFetch(statusBody);

    const error = await errorOf(createUpdaterClient(null, fetcher).readStatus());

    expect(error).toBeInstanceOf(UpdaterUnavailableError);
    expect(requests).toHaveLength(0);
  });

  it("maps a running-update conflict to UpdateAlreadyRunningError", async () => {
    const client = createUpdaterClient(
      settings,
      fetchAnswering(409, { error: "update_already_running" }),
    );

    expect(await errorOf(client.applyUpdate("1.1.0"))).toBeInstanceOf(UpdateAlreadyRunningError);
  });

  it("maps an unknown running version to CurrentVersionUnknownError", async () => {
    const client = createUpdaterClient(
      settings,
      fetchAnswering(503, { error: "current_version_unknown" }),
    );

    expect(await errorOf(client.checkForUpdate())).toBeInstanceOf(CurrentVersionUnknownError);
  });

  it("maps an unreachable release source to RELEASE_SOURCE_UNREACHABLE", async () => {
    const client = createUpdaterClient(
      settings,
      fetchAnswering(502, { error: "release_source_unreachable" }),
    );

    const error = await errorOf(client.checkForUpdate());

    expect((error as UpdaterFailedError).code).toBe("RELEASE_SOURCE_UNREACHABLE");
  });

  it("maps any other updater error to UPDATER_ERROR", async () => {
    const client = createUpdaterClient(settings, fetchAnswering(401, { error: "unauthorized" }));

    const error = await errorOf(client.readStatus());

    expect((error as UpdaterFailedError).code).toBe("UPDATER_ERROR");
  });

  it("keeps the token and the updater address out of the error message", async () => {
    const client = createUpdaterClient(settings, fetchAnswering(500, { error: "internal_error" }));

    const error = await errorOf(client.readStatus());

    expect(String((error as Error).message)).not.toContain("secret-token-value");
    expect(String((error as Error).message)).not.toContain("updater:3100");
  });
});
