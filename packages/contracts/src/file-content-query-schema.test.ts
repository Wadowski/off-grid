// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { fileContentQuerySchema } from "./file-content-query-schema.js";

describe("fileContentQuerySchema", () => {
  it("defaults the disposition to attachment", () => {
    expect(fileContentQuerySchema.parse({})).toEqual({ disposition: "attachment" });
  });

  it("accepts inline", () => {
    expect(fileContentQuerySchema.parse({ disposition: "inline" })).toEqual({
      disposition: "inline",
    });
  });

  it.each([{ disposition: "other" }, { disposition: "INLINE" }, { disposition: "inline", x: "1" }])(
    "refuses %o",
    (query) => {
      expect(fileContentQuerySchema.safeParse(query).success).toBe(false);
    },
  );
});
