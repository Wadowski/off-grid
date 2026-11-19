// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { createNotificationsModule } from "@offgrid/notifications";
import { migrateDeploy } from "@offgrid/db";
import { Pool } from "pg";
import { z } from "zod";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase } from "../../test/start-test-database.js";
import { RESET_SQL } from "../../test/constants.js";
import type { TestDatabase } from "../../test/types.js";
import { buildApp } from "../http/build-app.js";
import { createRuntime } from "../lifecycle/create-runtime.js";
import { DEFAULT_FILES_MAX_UPLOAD_BYTES } from "../constants.js";
import { modulesFor } from "../module-wiring/modules-for.js";
import { resolveRequestIdentity } from "./resolve-request-identity.js";
import type { ServerConfig, ServerRuntime } from "../types.js";

const PASSWORD = "correct horse battery staple";
const ANNA = { displayName: "Anna", email: "anna@example.com", password: PASSWORD };
const TRACE_HEADER = "x-trace-id";

const waitFor = async (condition: () => boolean): Promise<void> => {
  const deadline = Date.now() + 5000;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error("condition not met in time");
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5);
    });
  }
};

describe("notification stream on the real stack", { timeout: 120_000 }, () => {
  let database: TestDatabase;
  let admin: Pool;
  let config: ServerConfig;
  let runtime: ServerRuntime;
  let app: FastifyInstance;
  let baseUrl: string;

  beforeAll(async () => {
    database = await startTestDatabase();
    await migrateDeploy(database.migratorTarget);
    admin = new Pool({
      host: database.migratorTarget.host,
      port: database.migratorTarget.port,
      database: database.migratorTarget.database,
      user: database.migratorTarget.user,
      password: database.migratorTarget.password,
    });
    config = {
      http: { host: "127.0.0.1", port: 0 },
      database: database.connection,
      mail: { encryptionKey: Buffer.alloc(32, 7) },
      trustedProxies: [],
      corsOrigins: [],
      rateLimitPerMinute: 1000,
      outbox: { retentionDays: 7 },
      files: { directory: "/data/files", maxUploadBytes: DEFAULT_FILES_MAX_UPLOAD_BYTES },
      logLevel: "error",
    };
  }, 120_000);

  afterAll(async () => {
    await admin?.end();
    await database?.stop();
  }, 120_000);

  beforeEach(async () => {
    await admin.query(RESET_SQL);
    runtime = createRuntime(config);
    const modules = modulesFor(config).map((module) =>
      module.name === "notifications" ? createNotificationsModule({ streamHeartbeatMs: 20 }) : module,
    );
    app = await buildApp({
      config,
      runtime,
      modules,
      identity: (request) => resolveRequestIdentity(runtime, request),
    });
    const registered = await app.inject({ method: "POST", url: "/api/auth/register", payload: ANNA });
    if (registered.statusCode !== 201) {
      throw new Error(`register failed: ${registered.statusCode} ${registered.body}`);
    }
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (address === null || typeof address === "string") {
      throw new Error("server has no port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await app.close();
    await runtime.pool.end();
  });

  const signInToken = async (): Promise<string> => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: ANNA.email, password: PASSWORD },
    });
    if (response.statusCode !== 200) {
      throw new Error(`sign-in failed: ${response.statusCode} ${response.body}`);
    }
    return z.object({ accessToken: z.string() }).parse(response.json()).accessToken;
  };

  const openStream = async (token: string) => {
    const response = await fetch(`${baseUrl}/api/me/notifications/stream`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const reader = response.body?.getReader();
    if (reader === undefined) {
      throw new Error("stream has no body");
    }
    const received = { text: "", ended: false };
    const decoder = new TextDecoder();
    void (async () => {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          received.text += decoder.decode(value, { stream: true });
        }
      } catch {
        received.ended = true;
      }
      received.ended = true;
    })();
    return { response, received };
  };

  it("streams to a signed-in person with the request hooks applied", async () => {
    const token = await signInToken();

    const { response, received } = await openStream(token);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get(TRACE_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
    await waitFor(() => received.text.includes(": heartbeat"));
  });

  it("ends the stream once the person's session is ended", async () => {
    const token = await signInToken();
    const { received } = await openStream(token);
    const { rows } = await admin.query<{ session_id: string }>(
      "SELECT session_id FROM identity.session ORDER BY access_expires_at DESC LIMIT 1",
    );

    const ended = await app.inject({
      method: "DELETE",
      url: `/api/me/sessions/${rows[0]?.session_id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(ended.statusCode).toBeLessThan(300);
    await waitFor(() => received.ended);
    expect(received.ended).toBe(true);
  });
});
