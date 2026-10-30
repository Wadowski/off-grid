// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { sendReadOutcome } from "./send-read-outcome.js";

const buildApp = (outcome: Parameters<typeof sendReadOutcome>[1]) => {
  const app = Fastify();
  app.get("/thing", (_request, reply) => sendReadOutcome(reply, outcome));
  return app;
};

describe("sendReadOutcome", () => {
  it("sends the value as 200", async () => {
    const response = await buildApp({ outcome: "found", value: { id: "1" } }).inject({
      method: "GET",
      url: "/thing",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: "1" });
  });

  it("sends 404 with a generic code for a missing value", async () => {
    const response = await buildApp({ outcome: "not-found" }).inject({
      method: "GET",
      url: "/thing",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("NOT_FOUND");
  });

  it("sends 403 with a generic code for a value the user may not view", async () => {
    const response = await buildApp({ outcome: "forbidden" }).inject({
      method: "GET",
      url: "/thing",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("ACCESS_DENIED");
  });
});
