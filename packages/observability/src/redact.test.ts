// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { REDACTED, createRedactor, redact } from "./redact.js";

describe("redact", () => {
  it("redacts passwords, tokens and authorization headers at the top level", () => {
    expect(
      redact({
        password: "hunter2",
        accessToken: "abc",
        Authorization: "Bearer xyz",
        "x-auth-token": "t",
        cookie: "session=1",
        apiKey: "k",
        username: "ada",
      }),
    ).toEqual({
      password: REDACTED,
      accessToken: REDACTED,
      Authorization: REDACTED,
      "x-auth-token": REDACTED,
      cookie: REDACTED,
      apiKey: REDACTED,
      username: "ada",
    });
  });

  it("redacts nested objects and arrays", () => {
    expect(
      redact({
        request: { headers: { authorization: "Bearer xyz", accept: "json" } },
        users: [{ name: "Ada", password: "p" }],
      }),
    ).toEqual({
      request: { headers: { authorization: REDACTED, accept: "json" } },
      users: [{ name: "Ada", password: REDACTED }],
    });
  });

  it("redacts configured personal fields by whole key only", () => {
    const redactor = createRedactor({ extraKeys: ["name", "birthDate"] });
    expect(redactor({ name: "Ada", username: "ada", birth_date: "1990-01-01" })).toEqual({
      name: REDACTED,
      username: "ada",
      birth_date: REDACTED,
    });
  });

  it("does not mutate the input", () => {
    const input = { password: "p", nested: { token: "t" } };
    redact(input);
    expect(input).toEqual({ password: "p", nested: { token: "t" } });
  });

  it("keeps error name and message and redacts their extra fields", () => {
    const error = Object.assign(new Error("boom"), { secret: "s", code: "E1" });
    expect(redact(error)).toEqual({ name: "Error", message: "boom", secret: REDACTED, code: "E1" });
  });

  it("handles circular references and depth limits", () => {
    const loop: Record<string, unknown> = { id: 1 };
    loop["self"] = loop;
    expect(redact(loop)).toEqual({ id: 1, self: "[Circular]" });

    expect(createRedactor({ maxDepth: 2 })({ a: { b: { c: 1 } } })).toEqual({
      a: { b: "[Truncated]" },
    });
  });

  it("does not treat a shared, non-circular reference as circular", () => {
    const shared = { x: 1 };
    expect(redact({ first: shared, second: shared })).toEqual({
      first: { x: 1 },
      second: { x: 1 },
    });
  });
});
