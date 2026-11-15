// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

export const VARIANTS = [
  { suffix: "", label: "Light, desktop" },
  { suffix: "-mobile", label: "Light, mobile" },
  { suffix: "-dark", label: "Dark, desktop" },
  { suffix: "-dark-mobile", label: "Dark, mobile" },
];

const SUFFIX_ORDER = [...VARIANTS].sort((a, b) => b.suffix.length - a.suffix.length);

export const splitVariant = (fileName) => {
  const stem = fileName.replace(/\.png$/, "");
  const match = SUFFIX_ORDER.find((variant) => variant.suffix && stem.endsWith(variant.suffix));
  return match
    ? { screen: stem.slice(0, -match.suffix.length), suffix: match.suffix }
    : { screen: stem, suffix: "" };
};

export const sheetHtml = (cells) => {
  const figures = cells
    .map(
      ({ label, data }) =>
        `<figure><figcaption>${label}</figcaption>${
          data
            ? `<img src="data:image/png;base64,${data}">`
            : "<div class=missing>not captured</div>"
        }</figure>`,
    )
    .join("");
  return `<!doctype html><meta charset=utf-8><style>
body{margin:0;padding:16px;background:#888;font:14px sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
figure{margin:0;background:#fff;padding:8px}figcaption{font-weight:600;margin-bottom:8px;color:#111}
img{max-width:100%;display:block}.missing{padding:48px;color:#a00}
</style>${figures}`;
};

export const makeContactSheet = async (root, dir, screen) => {
  const { chromium } = createRequire(join(root, "e2e/package.json"))("@playwright/test");
  const cells = VARIANTS.map(({ suffix, label }) => {
    try {
      return { label, data: readFileSync(join(dir, `${screen}${suffix}.png`)).toString("base64") };
    } catch {
      return { label, data: null };
    }
  });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1800, height: 100 } });
    await page.setContent(sheetHtml(cells));
    const out = join(dir, `${screen}-sheet.png`);
    await page.screenshot({ path: out, fullPage: true });
    return out;
  } finally {
    await browser.close();
  }
};
