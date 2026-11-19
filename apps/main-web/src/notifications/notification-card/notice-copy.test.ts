// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOTIFICATION_TYPES } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { en } from "../../i18n/catalogs/en.js";
import { noticeCopy } from "./notice-copy.js";

const resolve = (path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[key]
          : undefined,
      en,
    );

describe("noticeCopy", () => {
  it.each(NOTIFICATION_TYPES)("resolves the title and body catalog keys for %s", (type) => {
    const copy = noticeCopy(type);

    expect(resolve(copy.titleId)).toEqual(expect.any(String));
    expect(resolve(copy.bodyId)).toEqual(expect.any(String));
  });

  it.each(["event-invited", "event-reminder"] as const)("offers View Event for %s", (type) => {
    expect(noticeCopy(type).actionId).toBe("notifications.actions.viewEvent");
  });

  it.each(["password-changed", "recovery-code-regenerated"] as const)(
    "offers no action for %s",
    (type) => {
      expect(noticeCopy(type).actionId).toBeUndefined();
    },
  );
});
