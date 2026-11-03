// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { loadMigrations, PRISMA_MIGRATIONS_DIRECTORY } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import { createLogger, createMemoryErrorSink, currentTraceId } from "@offgrid/observability";
import { afterEach, describe, expect, it } from "vitest";
import type { StubOptions } from "../../test/types.js";
import { buildApp } from "./build-app.js";
import type { IdentityResolver, ModuleDescriptor, ServerConfig, ServerRuntime } from "../types.js";
import { userIdSchema } from "@offgrid/contracts";

const baseConfig: ServerConfig = {
  http: { host: "127.0.0.1", port: 0 },
  database: {
    host: "unused",
    port: 5432,
    name: "unused",
    user: "offgrid_app",
    password: "unused",
    poolMax: 1,
  },
  trustedProxies: [],
  corsOrigins: [],
  rateLimitPerMinute: 1000,
  logLevel: "error",
};

const USER_ID = "11111111-1111-4111-8111-111111111111";

const familyModule: ModuleDescriptor = { name: "family" };

const stubRuntime = ({
  queryResult = "ok",
  publisherRunning = true,
  ledgerRows = [],
}: StubOptions = {}) => {
  const errorSink = createMemoryErrorSink();
  const pool = {
    query: async (text: string) => {
      if (queryResult === "fail") {
        throw new Error("connection refused");
      }
      return { rows: text.includes("_prisma_migrations") ? ledgerRows : [] };
    },
    end: async () => undefined,
    connect: async () => {
      throw new Error("connect is not used by these tests");
    },
  };
  const runtime: ServerRuntime = {
    pool: pool as unknown as Pool,
    eventBus: unusedEventBus,
    errorSink,
    logger: createLogger({ sink: () => undefined }),
    moduleDatabases: new Map(),
    state: { publisherRunning, draining: false },
  };
  return { runtime, errorSink };
};

const probeModule: ModuleDescriptor = {
  name: "probe",
  registerRoutes: (api) => {
    api.get("/probe/trace", async () => ({ traceId: currentTraceId() }));
    api.get("/probe/identity", async (request) => request.requestContext);
    api.get("/probe/fail", async () => {
      throw new Error("token=abc123 leaked here");
    });
    api.post<{ Body: { name: string } }>(
      "/probe/validated",
      {
        schema: {
          body: { type: "object", required: ["name"], properties: { name: { type: "string" } } },
        },
      },
      async () => ({ ok: true }),
    );
  },
};

const apps: FastifyInstance[] = [];

const testIdentity: IdentityResolver = async (request) => {
  const userId = request.headers["x-offgrid-user-id"];
  return {
    userId: typeof userId === "string" ? userIdSchema.parse(userId) : null,
    sessionId: null,
    familyId: null,
    accessGroupIds: [],
  };
};

const unusedEventBus: EventBus = {
  subscribe: () => {
    throw new Error("the event bus is not used by these tests");
  },
  subscribeTransport: () => {
    throw new Error("the event bus is not used by these tests");
  },
  deliverPending: () => {
    throw new Error("the event bus is not used by these tests");
  },
  start: () => {
    throw new Error("the event bus is not used by these tests");
  },
  stop: () => {
    throw new Error("the event bus is not used by these tests");
  },
  prune: () => {
    throw new Error("the event bus is not used by these tests");
  },
};

const build = async (
  overrides: Partial<ServerConfig>,
  runtime: ServerRuntime,
  modules: readonly ModuleDescriptor[] = [probeModule],
  identity?: IdentityResolver,
): Promise<FastifyInstance> => {
  const app = await buildApp({
    config: { ...baseConfig, ...overrides },
    runtime,
    modules,
    identity,
  });
  apps.push(app);
  return app;
};

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("CORS", () => {
  const WEB_ORIGIN = "http://localhost:8080";
  const OTHER_ORIGIN = "https://attacker.example";

  it("answers a preflight from an allowed origin, including the dev identity header", async () => {
    const { runtime } = stubRuntime();
    const app = await build({ corsOrigins: [WEB_ORIGIN] }, runtime, []);

    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/families",
      headers: {
        origin: WEB_ORIGIN,
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type,x-offgrid-dev-user-id",
      },
    });

    expect(response.headers["access-control-allow-origin"]).toBe(WEB_ORIGIN);
    expect(response.headers["access-control-allow-headers"]).toContain("x-offgrid-dev-user-id");
  });

  it("sends no allow-origin header to an origin that is not configured", async () => {
    const { runtime } = stubRuntime();
    const app = await build({ corsOrigins: [WEB_ORIGIN] }, runtime, []);

    const response = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: { origin: OTHER_ORIGIN },
    });

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows no cross-origin request when no origins are configured", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime, []);

    const response = await app.inject({
      method: "GET",
      url: "/api/health",
      headers: { origin: WEB_ORIGIN },
    });

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("health endpoints", () => {
  it("reports the process as up", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("reports ready when the database answers and the publisher runs", async () => {
    const expected = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
    const { runtime } = stubRuntime({
      ledgerRows: expected.map((migration) => ({
        migration_name: migration.name,
        checksum: migration.checksum,
      })),
    });
    const app = await build({}, runtime, []);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      checks: { database: "ok", publisher: "ok", migrations: "ok" },
    });
  });

  it("reports not ready with 503 when the database is unreachable", async () => {
    const { runtime } = stubRuntime({ queryResult: "fail" });
    const app = await build({}, runtime, []);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json().checks.database).toBe("unavailable");
    expect(response.body).not.toContain("connection refused");
  });

  it("reports not ready when the publisher is stopped", async () => {
    const { runtime } = stubRuntime({ publisherRunning: false });
    const app = await build({}, runtime, []);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json().checks.publisher).toBe("stopped");
  });

  it("reports migrations pending while the ledger lacks a registered migration", async () => {
    const { runtime } = stubRuntime({ ledgerRows: [] });
    const app = await build({}, runtime, [familyModule]);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json().checks.migrations).toBe("pending");
  });

  it("reports migrations ok once the ledger records each file with the same checksum", async () => {
    const expected = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
    const { runtime } = stubRuntime({
      ledgerRows: expected.map((migration) => ({
        migration_name: migration.name,
        checksum: migration.checksum,
      })),
    });
    const app = await build({}, runtime, [familyModule]);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json().checks.migrations).toBe("ok");
  });

  it("reports migrations pending when a recorded checksum differs from the file", async () => {
    const [migration] = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
    const { runtime } = stubRuntime({
      ledgerRows: [{ migration_name: migration!.name, checksum: "changed" }],
    });
    const app = await build({}, runtime, [familyModule]);

    const response = await app.inject({ method: "GET", url: "/api/health/ready" });

    expect(response.json().checks.migrations).toBe("pending");
  });
});

describe("request pipeline", () => {
  it("echoes a valid incoming trace id and runs module code inside it", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({
      method: "GET",
      url: "/api/probe/trace",
      headers: { "x-trace-id": "trace-abc.123" },
    });

    expect(response.headers["x-trace-id"]).toBe("trace-abc.123");
    expect(response.json()).toEqual({ traceId: "trace-abc.123" });
  });

  it("generates a trace id when the incoming one is malformed", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({
      method: "GET",
      url: "/api/probe/trace",
      headers: { "x-trace-id": "bad value with spaces" },
    });

    expect(response.headers["x-trace-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("ignores identity headers unless a resolver is configured", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({
      method: "GET",
      url: "/api/probe/identity",
      headers: { "x-offgrid-user-id": USER_ID },
    });

    expect(response.json()).toEqual({
      userId: null,
      sessionId: null,
      familyId: null,
      accessGroupIds: [],
    });
  });

  it("exposes the identity from the configured resolver to routes", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime, [probeModule], testIdentity);

    const response = await app.inject({
      method: "GET",
      url: "/api/probe/identity",
      headers: { "x-offgrid-user-id": USER_ID },
    });

    expect(response.json()).toEqual({
      userId: USER_ID,
      sessionId: null,
      familyId: null,
      accessGroupIds: [],
    });
  });

  it("maps a 500 to a generic body and records the real error out of the response", async () => {
    const { runtime, errorSink } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({ method: "GET", url: "/api/probe/fail" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ code: "INTERNAL_ERROR", message: "Internal server error" });
    expect(response.body).not.toContain("abc123");
    expect(errorSink.list()).toHaveLength(1);
  });

  it("does not echo the message of a library error that is not an application error", async () => {
    const { runtime } = stubRuntime();
    const leakyModule: ModuleDescriptor = {
      name: "probe",
      registerRoutes: (api) => {
        api.get("/probe/conflict", async () => {
          throw Object.assign(new Error("row owned by user 9f2c"), { statusCode: 409 });
        });
      },
    };
    const app = await build({}, runtime, [leakyModule]);

    const response = await app.inject({ method: "GET", url: "/api/probe/conflict" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ code: "REQUEST_REJECTED", message: "Request rejected" });
  });

  it("maps a schema violation to a 400 in the contracts error shape", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({ method: "POST", url: "/api/probe/validated", payload: {} });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
  });

  it("answers unknown routes with a NOT_FOUND body", async () => {
    const { runtime } = stubRuntime();
    const app = await build({}, runtime);

    const response = await app.inject({ method: "GET", url: "/api/nope" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ code: "NOT_FOUND", message: "Route not found" });
  });

  it("rate limits a client that exceeds the per-minute budget", async () => {
    const { runtime } = stubRuntime();
    const app = await build({ rateLimitPerMinute: 2 }, runtime);

    const statuses: number[] = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await app.inject({ method: "GET", url: "/api/health" });
      statuses.push(response.statusCode);
    }

    expect(statuses).toEqual([200, 200, 429]);
  });
});
