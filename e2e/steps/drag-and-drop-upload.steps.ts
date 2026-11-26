// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type JSHandle, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { E2E_UPLOAD_LIMIT_BYTES } from "../support/factories/files.js";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const UPLOAD_TIMEOUT_MS = 15_000;
const UPLOAD_ROUTE = /\/api\/drives\/[^/]+\/files$/;
const INTERNAL_ERROR_BODY = JSON.stringify({ code: "INTERNAL", message: "Internal server error" });

type DroppedFile = {
  readonly name: string;
  readonly text: string;
  readonly sizeBytes: number;
};

const uploadRequestCounts = new WeakMap<Page, number>();

const countUploadRequests = (page: Page): void => {
  uploadRequestCounts.set(page, 0);
  page.on("request", (request) => {
    if (request.method() === "POST" && UPLOAD_ROUTE.test(new URL(request.url()).pathname)) {
      uploadRequestCounts.set(page, (uploadRequestCounts.get(page) ?? 0) + 1);
    }
  });
};

const failNextUploadOnce = async (page: Page): Promise<void> => {
  let hasFailed = false;
  await page.route(UPLOAD_ROUTE, async (route) => {
    if (hasFailed) {
      await route.continue();
      return;
    }
    hasFailed = true;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: INTERNAL_ERROR_BODY,
    });
  });
};

const dropZone = (page: Page): Locator => page.getByTestId("files-drop-zone");

const dropOverlay = (page: Page): Locator => page.getByTestId("files-drop-overlay");

const queueRowNamed = (page: Page, name: string): Locator =>
  page.getByTestId("upload-queue-panel-row").filter({ hasText: name });

const retryButtonOf = (page: Page, name: string): Locator =>
  page.getByRole("button", { name: `Retry upload of ${name}` });

const dismissButtonOf = (page: Page, name: string): Locator =>
  page.getByRole("button", { name: `Dismiss ${name}` });

const fileNamesIn = (list: string): string[] =>
  [...list.matchAll(/"([^"]*)"/g)].map((match) => match[1] ?? "");

const textFiles = (names: readonly string[]): DroppedFile[] =>
  names.map((name) => ({ name, text: "hello", sizeBytes: 5 }));

const createDataTransfer = (page: Page, files: readonly DroppedFile[]): Promise<JSHandle> =>
  page.evaluateHandle((entries) => {
    const transfer = new DataTransfer();
    for (const entry of entries) {
      const content = entry.text === "" ? new Uint8Array(entry.sizeBytes) : entry.text;
      transfer.items.add(new File([content], entry.name, { type: "text/plain" }));
    }
    return transfer;
  }, files);

const dispatchDrag = async (
  page: Page,
  type: "dragenter" | "dragover" | "dragleave" | "drop",
  files: readonly DroppedFile[],
): Promise<void> => {
  const transfer = await createDataTransfer(page, files);
  await dropZone(page).dispatchEvent(type, { dataTransfer: transfer });
};

const dropFiles = async (page: Page, files: readonly DroppedFile[]): Promise<void> => {
  await dispatchDrag(page, "dragenter", files);
  await dispatchDrag(page, "dragover", files);
  await dispatchDrag(page, "drop", files);
};

When(/^Anna drops the files (".*") on the Files page$/, async ({ page }, list: string) => {
  countUploadRequests(page);
  await dropFiles(page, textFiles(fileNamesIn(list)));
});

When(
  /^Anna drops an oversized file "([^"]*)" together with "([^"]*)" on the Files page$/,
  async ({ page }, oversized: string, other: string) => {
    countUploadRequests(page);
    await dropFiles(page, [
      { name: oversized, text: "", sizeBytes: E2E_UPLOAD_LIMIT_BYTES + 1 },
      { name: other, text: "notes", sizeBytes: 5 },
    ]);
  },
);

When(/^Anna drags the files "([^"]*)" over the Files page$/, async ({ page }, name: string) => {
  await dispatchDrag(page, "dragenter", textFiles([name]));
  await dispatchDrag(page, "dragover", textFiles([name]));
});

When("Anna cancels the drag over the Files page", async ({ page }) => {
  await dispatchDrag(page, "dragleave", textFiles(["Holiday.txt"]));
});

When("Anna drags plain text over the Files page", async ({ page }) => {
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.setData("text/plain", "hello");
    return data;
  });
  await dropZone(page).dispatchEvent("dragenter", { dataTransfer: transfer });
});

When(
  /^Anna uploads the files "([^"]*)" with the Upload button and the first upload fails$/,
  async ({ page }, name: string) => {
    await failNextUploadOnce(page);
    await page.getByTestId("files-upload-input").setInputFiles({
      name,
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
  },
);

When(/^Anna retries the upload of "([^"]*)"$/, async ({ page }, name: string) => {
  await retryButtonOf(page, name).click();
});

When(/^Anna dismisses the upload of "([^"]*)"$/, async ({ page }, name: string) => {
  await dismissButtonOf(page, name).click();
});

When(
  /^Anna reaches the Retry button of "([^"]*)" with the keyboard$/,
  async ({ page }, name: string) => {
    await expect(async () => {
      await retryButtonOf(page, name).focus();
      await expect(retryButtonOf(page, name)).toBeFocused({ timeout: 500 });
    }).toPass({ timeout: UPLOAD_TIMEOUT_MS });
  },
);

Then("the drop zone is shown on the Files page", async ({ page }) => {
  await expect(dropOverlay(page)).toBeVisible({ timeout: UPLOAD_TIMEOUT_MS });
});

Then("the drop zone is hidden", async ({ page }) => {
  await expect(dropOverlay(page)).toHaveCount(0);
});

Then(/^the upload queue no longer shows "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(queueRowNamed(page, name)).toHaveCount(0, { timeout: UPLOAD_TIMEOUT_MS });
});

Then(
  /^the upload queue offers Dismiss but not Retry for "([^"]*)"$/,
  async ({ page }, name: string) => {
    await expect(dismissButtonOf(page, name)).toBeVisible({ timeout: UPLOAD_TIMEOUT_MS });
    await expect(retryButtonOf(page, name)).toHaveCount(0);
  },
);

Then("the oversized file was not sent to the server", async ({ page }) => {
  await expect(queueRowNamed(page, "Notes.txt")).toHaveAttribute("data-status", "done", {
    timeout: UPLOAD_TIMEOUT_MS,
  });
  expect(uploadRequestCounts.get(page)).toBe(1);
});

Then(/^the Retry button of "([^"]*)" is focused$/, async ({ page }, name: string) => {
  await expect(retryButtonOf(page, name)).toBeFocused();
});

Then(
  /^the Dismiss button of "([^"]*)" can be reached with the keyboard$/,
  async ({ page }, name: string) => {
    await page.keyboard.press("Tab");
    await expect(dismissButtonOf(page, name)).toBeFocused();
  },
);
