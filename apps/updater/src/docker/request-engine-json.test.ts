// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DockerApiError } from "./errors/docker-api-error.js";
import { requestEngineJson } from "./request-engine-json.js";

interface CannedReply {
  readonly status: number;
  readonly body: string;
}

describe("requestEngineJson", () => {
  let directory: string;
  let socketPath: string;
  let server: Server;
  let reply: CannedReply;

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), "offgrid-engine-json-"));
    socketPath = join(directory, "engine.sock");
    reply = { status: 200, body: "{}" };
    server = createServer((_request, response) => {
      response.writeHead(reply.status, { "content-type": "application/json" });
      response.end(reply.body);
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(directory, { recursive: true, force: true });
  });

  const request = (options: { acceptedStatuses?: readonly number[] } = {}) =>
    requestEngineJson(socketPath, "GET", "/containers/json", {
      operation: "list containers",
      ...options,
    });

  it("returns the parsed JSON body of a success response", async () => {
    reply = { status: 200, body: '{"ok":true}' };

    expect(await request()).toEqual({ ok: true });
  });

  it("returns null for an empty body", async () => {
    reply = { status: 204, body: "" };

    expect(await request()).toBeNull();
  });

  it.each([200, 299])("accepts status %i as a success", async (status) => {
    reply = { status, body: "[]" };

    expect(await request()).toEqual([]);
  });

  it.each([300, 404, 500])("rejects status %i with a DockerApiError", async (status) => {
    reply = { status, body: "{}" };

    await expect(request()).rejects.toThrow(new DockerApiError("list containers", status));
  });

  it("accepts a listed status outside the success range", async () => {
    reply = { status: 304, body: "" };

    expect(await request({ acceptedStatuses: [304] })).toBeNull();
  });

  it("wraps an unparsable success body in a DockerApiError without the body text", async () => {
    reply = { status: 200, body: "not json secret-value" };

    const failure = await request().catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DockerApiError);
    expect((failure as Error).message).not.toContain("secret-value");
  });
});
