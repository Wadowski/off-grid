// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { expect, type Download, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  findItemAcrossDrives,
  personalDriveIdAs,
  postAs,
  uploadFileAs,
} from "../support/factories/files.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { ownSessionOf } from "../support/own-session.js";
import { samplePdf } from "../support/sample-pdf.js";
import { samplePng } from "../support/sample-png.js";

const { Given, When, Then } = createBdd(test);

const savedDownloads = new WeakMap<Page, Download>();

const uploadPersonalFile = async (
  world: ScenarioWorld,
  name: string,
  body: string | Buffer,
  contentType: string,
): Promise<void> => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdAs(world.api, session);
  const response = await uploadFileAs(world.api, session, driveId, {
    name,
    parentId: null,
    body,
    contentType,
  });
  expect(response.status, `The file ${name} is uploaded`).toBe(201);
};

const downloadAfter = async (page: Page, trigger: Locator): Promise<void> => {
  const [download] = await Promise.all([page.waitForEvent("download"), trigger.click()]);
  savedDownloads.set(page, download);
};

const savedDownloadOf = (page: Page): Download => {
  const download = savedDownloads.get(page);
  if (download === undefined) {
    throw new Error("The browser has not saved a file in this scenario.");
  }
  return download;
};

const previewDialogOf = (page: Page): Locator => page.getByTestId("file-preview-dialog");

Given(
  /^Anna has a personal-drive file "([^"]*)" with the content "([^"]*)"$/,
  async ({ world }, name: string, content: string) => {
    await uploadPersonalFile(world, name, content, "text/plain");
  },
);

Given(/^Anna has a personal-drive image "([^"]*)"$/, async ({ world }, name: string) => {
  await uploadPersonalFile(world, name, samplePng(), "image/png");
});

Given(/^Anna has a personal-drive PDF "([^"]*)"$/, async ({ world }, name: string) => {
  await uploadPersonalFile(world, name, samplePdf(), "application/pdf");
});

Given(
  /^Anna has a personal-drive web page "([^"]*)" with the content "([^"]*)"$/,
  async ({ world }, name: string, content: string) => {
    await uploadPersonalFile(world, name, content, "text/html");
  },
);

When(/^the image "([^"]*)" is moved to the trash$/, async ({ world }, name: string) => {
  const session = await ownSessionOf(world);
  const item = await findItemAcrossDrives(world.api, session, name);
  const response = await postAs(world.api, session, `/api/files/${item.id}/trash`, undefined);
  expect(response.status, `The image ${name} is trashed`).toBe(200);
});

When("Anna downloads the file from its details", async ({ page }) => {
  await downloadAfter(page, page.getByRole("button", { name: "Download" }));
});

When("Anna previews the file from its details", async ({ page }) => {
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(previewDialogOf(page)).toBeVisible();
});

When("Anna downloads the file from the preview dialog", async ({ page }) => {
  await downloadAfter(page, previewDialogOf(page).getByRole("button", { name: "Download" }));
});

When("Anna closes the preview with its Close control", async ({ page }) => {
  await previewDialogOf(page).getByRole("button", { name: "Close preview" }).click();
});

When("Anna presses Escape in the preview dialog", async ({ page }) => {
  await page.keyboard.press("Escape");
});

Then(
  /^the browser saves the file "([^"]*)" with the content "([^"]*)"$/,
  async ({ page }, name: string, content: string) => {
    const download = savedDownloadOf(page);
    expect(download.suggestedFilename()).toBe(name);
    expect(await readFile(await download.path(), "utf8")).toBe(content);
  },
);

Then(/^the browser saves the file "([^"]*)"$/, async ({ page }, name: string) => {
  expect(savedDownloadOf(page).suggestedFilename()).toBe(name);
});

Then("the file details offer Download and Preview", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview" })).toBeVisible();
});

Then("the file details offer Download and no Preview", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview" })).toHaveCount(0);
});

Then(/^the preview dialog is titled "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(page.getByRole("dialog", { name })).toBeVisible();
});

Then(/^the preview dialog shows the image "([^"]*)"$/, async ({ page }, name: string) => {
  const image = previewDialogOf(page).getByRole("img", { name });
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
});

Then(/^the preview dialog shows the PDF "([^"]*)"$/, async ({ page }, name: string) => {
  const hasViewer = await page.evaluate(() => navigator.pdfViewerEnabled);
  if (!hasViewer) {
    const fallback = previewDialogOf(page).getByTestId("file-preview-pdf-unavailable");
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText("This PDF can't be shown here.");
    await expect(
      previewDialogOf(page).getByTestId("file-preview-pdf-unavailable-download"),
    ).toBeVisible();
    return;
  }
  const frame = previewDialogOf(page).locator("iframe");
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute("title", `Preview of ${name}`);
  await expect(frame).toHaveAttribute("src", /^blob:/);
});

Then("the preview dialog is not shown", async ({ page }) => {
  await expect(previewDialogOf(page)).toHaveCount(0);
});

Then("the preview dialog tells that the file could not be shown", async ({ page }) => {
  await expect(previewDialogOf(page).getByTestId("file-preview-error")).toBeVisible();
});

Then("the preview dialog offers Try again", async ({ page }) => {
  await expect(previewDialogOf(page).getByRole("button", { name: "Try again" })).toBeVisible();
});

Then("the Preview control in the file details has the keyboard focus", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Preview" })).toBeFocused();
});
