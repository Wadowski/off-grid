// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { ServerRuntime } from "../types.js";
import { moduleContextFor } from "./module-context-for.js";

describe("moduleContextFor", () => {
  const runtime = {
    pool: {},
    moduleDatabases: new Map(),
    eventBus: {},
    logger: { child: () => ({}) },
  } as unknown as ServerRuntime;

  it("exposes the instance admin check to every module", () => {
    const context = moduleContextFor(runtime, "system");

    expect(typeof context.isInstanceAdmin).toBe("function");
  });

  it("re-verifies the bearer session for long-lived requests", async () => {
    const context = moduleContextFor(runtime, "notifications");
    const request = { headers: {} };

    await expect(context.verifySession(request as never)).resolves.toBeNull();
  });

  it("reads the caller from the request context", () => {
    const context = moduleContextFor(runtime, "system");
    const request = { requestContext: { userId: "user-1", familyId: null, sessionId: "s-1" } };

    expect(context.currentUserId(request as never)).toBe("user-1");
    expect(context.currentSessionId(request as never)).toBe("s-1");
  });
});
