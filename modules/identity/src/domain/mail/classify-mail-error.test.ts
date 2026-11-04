// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { classifyMailError } from "./classify-mail-error.js";

describe("classifyMailError", () => {
  it("reports a rejected password for an authentication error code", () => {
    expect(classifyMailError(Object.assign(new Error("auth"), { code: "EAUTH" }))).toBe(
      "AUTH_REJECTED",
    );
  });

  it("reports a rejected password for a 535 SMTP response", () => {
    expect(classifyMailError(Object.assign(new Error("535"), { responseCode: 535 }))).toBe(
      "AUTH_REJECTED",
    );
  });

  it("reports an unreachable server for a connection error", () => {
    expect(classifyMailError(Object.assign(new Error("conn"), { code: "ECONNECTION" }))).toBe(
      "UNREACHABLE",
    );
  });

  it("reports a rejected message for anything else", () => {
    expect(classifyMailError(new Error("550 mailbox unavailable"))).toBe("REJECTED");
    expect(classifyMailError("not an error object")).toBe("REJECTED");
  });
});
