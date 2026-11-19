// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyRequest } from "fastify";
import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import type { SessionVerifier } from "../../types.js";
import { checkStreamSession } from "./check-stream-session.js";

const USER_A = "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d";
const USER_B = "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e";
const request = {} as FastifyRequest;

const loggerSpy = () => {
  const warn = vi.fn();
  const logger = { debug: vi.fn(), info: vi.fn(), warn, error: vi.fn(), child: vi.fn() };
  return { logger: logger as unknown as Logger, warn };
};

const verifierReturning = (
  session: Awaited<ReturnType<SessionVerifier>>,
): SessionVerifier => vi.fn(async () => session);

describe("checkStreamSession", () => {
  it("reports active while the session still belongs to the stream's person", async () => {
    const verifier = verifierReturning({
      userId: USER_A,
      sessionId: "s-1",
      accessExpiresAt: new Date(),
    });

    await expect(checkStreamSession(verifier, request, USER_A, loggerSpy().logger)).resolves.toBe(
      "active",
    );
  });

  it("reports ended when the session no longer verifies", async () => {
    await expect(
      checkStreamSession(verifierReturning(null), request, USER_A, loggerSpy().logger),
    ).resolves.toBe("ended");
  });

  it("reports ended when the session now belongs to another person", async () => {
    const verifier = verifierReturning({
      userId: USER_B,
      sessionId: "s-1",
      accessExpiresAt: new Date(),
    });

    await expect(checkStreamSession(verifier, request, USER_A, loggerSpy().logger)).resolves.toBe(
      "ended",
    );
  });

  it("reports unknown and logs only the error type when the check fails", async () => {
    const failing: SessionVerifier = async () => {
      throw new TypeError("connection to postgres://secret-host failed");
    };
    const { logger, warn } = loggerSpy();

    await expect(checkStreamSession(failing, request, USER_A, logger)).resolves.toBe("unknown");

    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain("TypeError");
    expect(logged).not.toContain("secret-host");
    expect(logged).not.toContain(USER_A);
  });
});
