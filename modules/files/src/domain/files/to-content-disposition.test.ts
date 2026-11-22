// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toContentDisposition } from "./to-content-disposition.js";

describe("toContentDisposition", () => {
  it("names an ASCII file in both the fallback and the encoded form", () => {
    expect(toContentDisposition("Notes.txt", "attachment")).toBe(
      "attachment; filename=\"Notes.txt\"; filename*=UTF-8''Notes.txt",
    );
  });

  it("keeps spaces in the fallback and encodes them in the encoded form", () => {
    expect(toContentDisposition("my notes.txt", "inline")).toBe(
      "inline; filename=\"my notes.txt\"; filename*=UTF-8''my%20notes.txt",
    );
  });

  it("replaces quotes and backslashes in the fallback", () => {
    expect(toContentDisposition('a"b\\c.txt', "attachment")).toBe(
      "attachment; filename=\"a_b_c.txt\"; filename*=UTF-8''a%22b%5Cc.txt",
    );
  });

  it("encodes CR and LF so the header cannot be broken", () => {
    const header = toContentDisposition("x\r\nSet-Cookie: a=b.txt", "attachment");
    expect(header).not.toMatch(/[\r\n]/);
    expect(header).toContain("filename*=UTF-8''x%0D%0ASet-Cookie%3A%20a%3Db.txt");
  });

  it("replaces non-ASCII characters in the fallback and encodes them in the encoded form", () => {
    expect(toContentDisposition("zażółć.pdf", "attachment")).toBe(
      "attachment; filename=\"za____.pdf\"; filename*=UTF-8''za%C5%BC%C3%B3%C5%82%C4%87.pdf",
    );
  });

  it("encodes emoji as UTF-8", () => {
    expect(toContentDisposition("🙂.txt", "attachment")).toBe(
      "attachment; filename=\"__.txt\"; filename*=UTF-8''%F0%9F%99%82.txt",
    );
  });

  it("replaces a lone surrogate so the name can still be encoded", () => {
    expect(toContentDisposition("a\uD83D.txt", "attachment")).toBe(
      "attachment; filename=\"a_.txt\"; filename*=UTF-8''a_.txt",
    );
  });

  it("encodes the characters RFC 5987 reserves inside the encoded form", () => {
    expect(toContentDisposition("it's (1)*.txt", "attachment")).toBe(
      "attachment; filename=\"it's (1)*.txt\"; filename*=UTF-8''it%27s%20%281%29%2A.txt",
    );
  });

  it("falls back to a fixed name when nothing printable is left", () => {
    expect(toContentDisposition("   ", "attachment")).toBe(
      "attachment; filename=\"download\"; filename*=UTF-8''%20%20%20",
    );
  });

  it("keeps a very long name whole in the encoded form", () => {
    const longName = `${"n".repeat(300)}.txt`;
    expect(toContentDisposition(longName, "attachment")).toContain(`filename*=UTF-8''${longName}`);
  });
});
