// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toFolderLoadingLayout } from "./to-folder-loading-layout.js";

describe("toFolderLoadingLayout", () => {
  it.each([
    { phone: true, view: "list", layout: "phone" },
    { phone: true, view: "grid", layout: "phone" },
    { phone: false, view: "list", layout: "table" },
    { phone: false, view: "grid", layout: "grid" },
  ] as const)(
    "uses the $layout placeholders for phone=$phone and view $view",
    ({ phone, view, layout }) => {
      expect(toFolderLoadingLayout(phone, view)).toBe(layout);
    },
  );
});
