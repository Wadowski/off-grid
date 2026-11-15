// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { groupScreens } from "./ui-screens.mjs";
import { sheetHtml, splitVariant } from "./ui-contact-sheet.mjs";

test("splitVariant separates the screen from its theme and width suffix", () => {
  assert.deepEqual(splitVariant("month.png"), { screen: "month", suffix: "" });
  assert.deepEqual(splitVariant("month-mobile.png"), { screen: "month", suffix: "-mobile" });
  assert.deepEqual(splitVariant("month-dark.png"), { screen: "month", suffix: "-dark" });
  assert.deepEqual(splitVariant("month-dark-mobile.png"), {
    screen: "month",
    suffix: "-dark-mobile",
  });
});

test("groupScreens groups variants per feature and screen, ignoring sheets", () => {
  const groups = groupScreens([
    { feature: "calendar", file: "month.png" },
    { feature: "calendar", file: "month-dark.png" },
    { feature: "calendar", file: "month-sheet.png" },
    { feature: "calendar", file: "week.png" },
  ]);
  assert.deepEqual(groups, [
    { feature: "calendar", screen: "month", variants: ["", "-dark"] },
    { feature: "calendar", screen: "week", variants: [""] },
  ]);
});

test("sheetHtml marks variants that were not captured", () => {
  const html = sheetHtml([
    { label: "Light, desktop", data: "AAA" },
    { label: "Dark, mobile", data: null },
  ]);
  assert.match(html, /base64,AAA/);
  assert.match(html, /not captured/);
});
