// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { withUser } from "./with-user.js";

const USER_HEADER = "x-test-user-id";
const currentUserId = (request: { headers: Record<string, unknown> }) => {
  const header = request.headers[USER_HEADER];
  return typeof header === "string" ? header : null;
};

describe("withUser", () => {
  const buildApp = () => {
    const app = Fastify();
    app.get(
      "/me",
      withUser(currentUserId, async (_request, reply, userId) => reply.send({ userId })),
    );
    return app;
  };

  it("passes the signed-in user to the handler", async () => {
    const response = await buildApp().inject({
      method: "GET",
      url: "/me",
      headers: { [USER_HEADER]: "u1" },
    });

    expect(response.json()).toEqual({ userId: "u1" });
  });

  it("answers 401 without calling the handler when no user is signed in", async () => {
    const response = await buildApp().inject({ method: "GET", url: "/me" });

    expect(response.statusCode).toBe(401);
    expect(response.json().code).toBe("UNAUTHENTICATED");
  });
});
