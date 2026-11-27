// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type FileChooser, type Locator, type Page, type Request } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { webBaseUrl } from "../support/stack.js";
import { E2E_UPLOAD_LIMIT_BYTES } from "../support/factories/files.js";
import { UPLOAD_ROUTE } from "../support/upload-route.js";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const UPLOAD_TIMEOUT_MS = 15_000;
const PANEL_TIMEOUT_MS = 10_000;

const heldUploads = new WeakMap<
  Page,
  { readonly promise: Promise<void>; readonly release: () => void }
>();
const fileChoosers = new WeakMap<Page, Promise<FileChooser>>();
const uploadRequests = new WeakMap<
  Page,
  { readonly urls: string[]; readonly listener: (request: Request) => void }
>();

const textFile = (name: string, body: string) => ({
  name,
  mimeType: "text/plain",
  buffer: Buffer.from(body),
});

const uploadInput = (page: Page): Locator => page.getByTestId("files-upload-input");

const uploadButton = (page: Page): Locator => page.getByTestId("files-upload-button");

const queueRow = (page: Page, name: string): Locator =>
  page.getByTestId("upload-queue-panel-row").filter({ has: page.getByText(name, { exact: true }) });

const folderRow = (page: Page, name: string): Locator =>
  page
    .getByTestId("file-table-row")
    .filter({ has: page.getByTestId("file-table-name").getByText(name, { exact: true }) });

const holdUploads = async (page: Page): Promise<void> => {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  heldUploads.set(page, { promise, release });
  await page.route(UPLOAD_ROUTE, async (route) => {
    await promise;
    await route.continue();
  });
};

const uploadNames = async (page: Page, names: readonly string[]): Promise<void> => {
  await uploadInput(page).setInputFiles(names.map((name) => textFile(name, "hello")));
};

When(
  /^Anna uploads the files "([^"]*)" with the Upload button$/,
  async ({ page }, name: string) => {
    await uploadNames(page, [name]);
  },
);

When(
  /^Anna uploads the files "([^"]*)" and "([^"]*)" with the Upload button$/,
  async ({ page }, first: string, second: string) => {
    await uploadNames(page, [first, second]);
  },
);

When(
  /^Anna uploads an oversized file "([^"]*)" together with "([^"]*)" with the Upload button$/,
  async ({ page }, oversized: string, other: string) => {
    await uploadInput(page).setInputFiles([
      { name: oversized, mimeType: "image/jpeg", buffer: Buffer.alloc(E2E_UPLOAD_LIMIT_BYTES + 1) },
      textFile(other, "notes"),
    ]);
  },
);

When(
  /^Anna uploads the files "([^"]*)" from the phone top row$/,
  async ({ page }, name: string) => {
    await uploadNames(page, [name]);
  },
);

When(
  /^Anna uploads the files "([^"]*)" with the Upload button while the upload is slow$/,
  async ({ page }, name: string) => {
    await holdUploads(page);
    await uploadNames(page, [name]);
  },
);

When("the upload finishes", async ({ page }) => {
  heldUploads.get(page)?.release();
  await expect(page.getByTestId("upload-queue-panel-clear")).toBeVisible({
    timeout: UPLOAD_TIMEOUT_MS,
  });
});

When("Anna opens her personal drive in the browser", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/files`);
  await page
    .getByRole("navigation", { name: "Drives" })
    .getByRole("link", { name: "Personal", exact: true })
    .click();
  await expect(uploadButton(page)).toBeEnabled({ timeout: UPLOAD_TIMEOUT_MS });
});

When("Anna opens the Calendar page", async ({ page }) => {
  await page.getByRole("link", { name: "Calendar", exact: true }).click();
  await expect(page).toHaveURL(/\/calendar/);
});

When("Anna goes back to the Files page in the app", async ({ page }) => {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Files", exact: true })
    .click();
  await expect(page).toHaveURL(/\/files/);
  await page
    .getByRole("navigation", { name: "Drives" })
    .getByRole("link", { name: "Personal", exact: true })
    .click();
  await expect(uploadButton(page)).toBeEnabled({ timeout: UPLOAD_TIMEOUT_MS });
});

When("Anna reaches the Upload button with the keyboard and presses Enter", async ({ page }) => {
  await expect(uploadButton(page)).toBeEnabled({ timeout: UPLOAD_TIMEOUT_MS });
  await expect(async () => {
    await uploadButton(page).focus();
    await expect(uploadButton(page)).toBeFocused({ timeout: 500 });
  }).toPass({ timeout: UPLOAD_TIMEOUT_MS });
  fileChoosers.set(page, page.waitForEvent("filechooser"));
  await page.keyboard.press("Enter");
});

When("Anna expands the upload sheet", async ({ page }) => {
  const toggle = page.getByTestId("upload-queue-panel-toggle");
  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }
});

When("Anna presses Escape in the upload sheet", async ({ page }) => {
  const toggle = page.getByTestId("upload-queue-panel-toggle");
  await toggle.focus();
  await page.keyboard.press("Escape");
});

When("Anna clears the finished uploads", async ({ page }) => {
  await page.getByTestId("upload-queue-panel-clear").click();
});

Then(/^the upload queue shows "([^"]*)" as uploaded$/, async ({ page }, name: string) => {
  await expect(queueRow(page, name).first()).toHaveAttribute("data-status", "done", {
    timeout: UPLOAD_TIMEOUT_MS,
  });
});

Then(
  /^the upload queue shows "([^"]*)" as failed with "([^"]*)"$/,
  async ({ page }, name: string, reason: string) => {
    const row = page.getByTestId("upload-queue-panel-row").filter({ hasText: name });
    await expect(row).toHaveAttribute("data-status", "failed", { timeout: UPLOAD_TIMEOUT_MS });
    await expect(row).toContainText(reason);
  },
);

Then("the floating upload panel is not shown", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel")).toHaveCount(0);
});

Then(/^the folder lists the file "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(folderRow(page, name)).toBeVisible({ timeout: UPLOAD_TIMEOUT_MS });
});

Then(/^the folder does not list the file "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(folderRow(page, name)).toHaveCount(0);
});

Then(/^the floating upload panel shows "([^"]*)" as uploaded$/, async ({ page }, name: string) => {
  await expect(
    page.getByTestId("upload-queue-panel-row").filter({ hasText: name }),
  ).toHaveAttribute("data-status", "done", { timeout: UPLOAD_TIMEOUT_MS });
});

Then("the floating upload panel is shown", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel")).toBeVisible({ timeout: PANEL_TIMEOUT_MS });
});

Then("the upload sheet is expanded", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

Then("the upload sheet is minimized", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

Then("focus returns to the upload sheet toggle", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel-toggle")).toBeFocused();
});

Then("the clear finished action is not offered", async ({ page }) => {
  await expect(page.getByTestId("upload-queue-panel-clear")).toHaveCount(0);
});

Then("the file chooser is opened", async ({ page }) => {
  const chooser = fileChoosers.get(page);
  if (chooser === undefined) {
    throw new Error("No keyboard press on the Upload button was recorded.");
  }
  await chooser;
});

When("Anna opens Files from the sidebar without a drive", async ({ page }) => {
  const urls: string[] = [];
  const listener = (request: Request): void => {
    if (request.method() === "POST" && UPLOAD_ROUTE.test(new URL(request.url()).pathname)) {
      urls.push(request.url());
    }
  };
  uploadRequests.set(page, { urls, listener });
  page.on("request", listener);
  await page.goto(`${webBaseUrl()}/`);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Files", exact: true })
    .click();
  await expect(page).toHaveURL(/\/files\/?$/);
});

Then(/^Anna sees the no-drive caption "([^"]*)"$/, async ({ page }, caption: string) => {
  await expect(page.getByText(caption, { exact: true })).toBeVisible({
    timeout: UPLOAD_TIMEOUT_MS,
  });
});

Then("the Files Upload button is disabled without a drive", async ({ page }) => {
  await expect(uploadButton(page)).toBeDisabled({ timeout: UPLOAD_TIMEOUT_MS });
});

Then("the Files New folder button is disabled without a drive", async ({ page }) => {
  await expect(page.getByTestId("files-new-folder-button")).toBeDisabled({
    timeout: UPLOAD_TIMEOUT_MS,
  });
});

Then("the Files Upload button explains why it is unavailable", async ({ page }) => {
  await expect(uploadButton(page)).toHaveAccessibleDescription(
    "Select a drive in the panel to upload files.",
  );
});

Then("no upload request is made from Files without a drive", async ({ page }) => {
  const watch = uploadRequests.get(page);
  try {
    await expect(uploadButton(page)).toBeDisabled({ timeout: UPLOAD_TIMEOUT_MS });
    expect(watch?.urls ?? []).toEqual([]);
  } finally {
    if (watch !== undefined) {
      page.off("request", watch.listener);
    }
  }
});
