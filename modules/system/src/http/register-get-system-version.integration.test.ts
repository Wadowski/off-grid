// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { createSystemModule } from "../index.js";

const buildApp = async (version: { version: string; commit?: string }) => {
  const app = Fastify();
  createSystemModule(version).registerRoutes(app);
  await app.ready();
  return app;
};

describe("GET /system/version", () => {
  it("answers without a sign-in with the version and nothing else", async () => {
    const app = await buildApp({ version: "1.2.3" });

    const response = await app.inject({ method: "GET", url: "/system/version" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ version: "1.2.3" });
    await app.close();
  });

  it("answers the same to a request that carries a junk bearer token", async () => {
    const app = await buildApp({ version: "1.2.3" });

    const response = await app.inject({
      method: "GET",
      url: "/system/version",
      headers: { authorization: "Bearer not-a-real-token" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({ version: "1.2.3" });
    await app.close();
  });

  it("includes the commit when one is configured", async () => {
    const app = await buildApp({ version: "1.2.3", commit: "abc1234" });

    const response = await app.inject({ method: "GET", url: "/system/version" });

    expect(response.json()).toStrictEqual({ version: "1.2.3", commit: "abc1234" });
    await app.close();
  });
});
