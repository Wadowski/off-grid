// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toContentHeaders } from "./to-content-headers.js";

const base = {
  fileName: "Notes.txt",
  mediaType: "text/plain",
  requestedDisposition: "attachment",
  sizeBytes: 11,
  span: null,
} as const;

describe("toContentHeaders", () => {
  it("sends the whole file as an attachment by default", () => {
    expect(toContentHeaders(base)).toEqual({
      "accept-ranges": "bytes",
      "cache-control": "private, no-store",
      "content-disposition": "attachment; filename=\"Notes.txt\"; filename*=UTF-8''Notes.txt",
      "content-length": "11",
      "content-type": "application/octet-stream",
      "x-content-type-options": "nosniff",
    });
  });

  it("shows an image inline with its own media type and a sandboxing policy", () => {
    expect(
      toContentHeaders({
        ...base,
        fileName: "photo.png",
        mediaType: "image/png",
        requestedDisposition: "inline",
      }),
    ).toMatchObject({
      "content-disposition": "inline; filename=\"photo.png\"; filename*=UTF-8''photo.png",
      "content-type": "image/png",
      "content-security-policy": "default-src 'none'; sandbox",
    });
  });

  it("shows a PDF inline with the viewer policy", () => {
    expect(
      toContentHeaders({
        ...base,
        mediaType: "application/pdf",
        requestedDisposition: "inline",
      }),
    ).toMatchObject({
      "content-type": "application/pdf",
      "content-security-policy": "default-src 'none'; object-src 'self'; frame-ancestors 'self'",
    });
  });

  it("falls back to an attachment for a type that is not safe to show", () => {
    const headers = toContentHeaders({
      ...base,
      fileName: "page.html",
      mediaType: "text/html",
      requestedDisposition: "inline",
    });
    expect(headers["content-disposition"]).toMatch(/^attachment;/);
    expect(headers["content-type"]).toBe("application/octet-stream");
    expect(headers).not.toHaveProperty("content-security-policy");
  });

  it("never shows an SVG inline", () => {
    const headers = toContentHeaders({
      ...base,
      mediaType: "image/svg+xml",
      requestedDisposition: "inline",
    });
    expect(headers["content-disposition"]).toMatch(/^attachment;/);
    expect(headers).not.toHaveProperty("content-security-policy");
  });

  it("describes a partial answer with its length and range", () => {
    expect(toContentHeaders({ ...base, span: { start: 2, end: 4 } })).toMatchObject({
      "content-length": "3",
      "content-range": "bytes 2-4/11",
    });
  });

  it("omits Content-Range for a whole-file answer", () => {
    expect(toContentHeaders(base)).not.toHaveProperty("content-range");
  });
});
