// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SystemUpdate } from "./types.js";
import { webSystemClient } from "../../../../api/web-api-client.js";
import { AdminUpdateSection } from "./admin-update-section.js";

vi.mock("../../../../api/web-api-client.js", () => ({
  webSystemClient: {
    update: vi.fn(),
    checkForUpdate: vi.fn(),
    applyUpdate: vi.fn(),
    setNightlyUpdate: vi.fn(),
  },
}));

const updateMock = vi.mocked(webSystemClient.update);
const checkMock = vi.mocked(webSystemClient.checkForUpdate);
const applyMock = vi.mocked(webSystemClient.applyUpdate);
const nightlyMock = vi.mocked(webSystemClient.setNightlyUpdate);

const systemUpdateWith = (overrides: Partial<SystemUpdate>): SystemUpdate => ({
  currentVersion: "1.2.3",
  latestVersion: "1.2.3",
  updateAvailable: false,
  updateAllowed: true,
  checkedAt: "2026-11-20T10:00:00.000Z",
  runState: "idle",
  lastRun: null,
  running: false,
  nightlyEnabled: false,
  ...overrides,
});

const availableUpdate = systemUpdateWith({ latestVersion: "1.3.0", updateAvailable: true });

const updateButton = () => screen.getByRole("button", { name: "Update system" });
const checkButton = () => screen.getByRole("button", { name: "Check for updates" });
const nightlyToggle = () =>
  screen.getByLabelText("Update automatically every night", { exact: true });

const renderLoaded = async (update = systemUpdateWith({})) => {
  updateMock.mockResolvedValue(update);
  render(<AdminUpdateSection />);
  await screen.findByText("Running version");
};

const originalShowModal = HTMLDialogElement.prototype.showModal;

describe("AdminUpdateSection", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    updateMock.mockReset();
    checkMock.mockReset();
    applyMock.mockReset();
    nightlyMock.mockReset();
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
  });

  it("disables Update system and says the system is up to date", async () => {
    await renderLoaded(systemUpdateWith({}));

    expect(updateButton()).toBeDisabled();
    expect(screen.getByText("You are up to date", { exact: true })).toBeInTheDocument();
  });

  it("enables Update system when a newer version can be installed", async () => {
    await renderLoaded(availableUpdate);

    expect(updateButton()).toBeEnabled();
  });

  it("explains that a too old version cannot update directly", async () => {
    await renderLoaded(
      systemUpdateWith({ latestVersion: "2.0.0", updateAvailable: true, updateAllowed: false }),
    );

    expect(updateButton()).toBeDisabled();
    expect(
      screen.getByText("This version is too old to update directly. See the update guide.", {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it("checks for updates and shows the latest version it found", async () => {
    await renderLoaded(systemUpdateWith({}));
    checkMock.mockResolvedValue({
      currentVersion: "1.2.3",
      latestVersion: "1.3.0",
      updateAvailable: true,
      updateAllowed: true,
      checkedAt: "2026-11-20T11:00:00.000Z",
    });
    updateMock.mockResolvedValue(availableUpdate);

    fireEvent.click(checkButton());

    expect(await screen.findByText("1.3.0", { exact: true })).toBeInTheDocument();
    expect(checkMock).toHaveBeenCalledTimes(1);
  });

  it("opens a confirmation that names the backup and the automatic rollback, and cancel makes no call", async () => {
    await renderLoaded(availableUpdate);

    fireEvent.click(updateButton());
    const dialog = await screen.findByTestId("admin-update-confirm");
    expect(
      within(dialog).getByText("The database is backed up first.", { exact: false }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("goes back to the current version automatically", { exact: false }),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByTestId("admin-update-confirm")).not.toBeInTheDocument(),
    );
    expect(applyMock).not.toHaveBeenCalled();
  });

  it("calls apply once when the admin confirms and shows the progress while it runs", async () => {
    await renderLoaded(availableUpdate);
    applyMock.mockResolvedValue({ started: true, targetVersion: "1.3.0" });
    updateMock.mockResolvedValue(
      systemUpdateWith({
        latestVersion: "1.3.0",
        updateAvailable: true,
        running: true,
        runState: "running",
        lastRun: {
          runId: "5b0f7a52-3c1e-4c53-9d0a-2f7f1d8e6a10",
          currentVersion: "1.2.3",
          targetVersion: "1.3.0",
          startedAt: "2026-11-20T10:00:00.000Z",
          finishedAt: null,
          outcome: "in_progress",
          failedStep: null,
          steps: [
            { name: "verify_version", state: "succeeded", startedAt: null, finishedAt: null },
            { name: "backup", state: "running", startedAt: null, finishedAt: null },
          ],
          backupName: null,
          previousImages: null,
          writesAfterBackupLost: false,
          message: "Update in progress.",
        },
      }),
    );

    fireEvent.click(updateButton());
    fireEvent.click(await screen.findByRole("button", { name: "Update now" }));

    expect(await screen.findByText("Backing up the database", { exact: true })).toBeInTheDocument();
    expect(applyMock).toHaveBeenCalledTimes(1);
    expect(updateButton()).toBeDisabled();
    expect(checkButton()).toBeDisabled();
  });

  it("shows the rolled back message with the failed step", async () => {
    await renderLoaded(
      systemUpdateWith({
        latestVersion: "1.3.0",
        updateAvailable: true,
        runState: "rolled_back",
        lastRun: {
          runId: "5b0f7a52-3c1e-4c53-9d0a-2f7f1d8e6a10",
          currentVersion: "1.2.3",
          targetVersion: "1.3.0",
          startedAt: "2026-11-20T10:00:00.000Z",
          finishedAt: "2026-11-20T10:05:00.000Z",
          outcome: "rolled_back",
          failedStep: "migrate",
          steps: [],
          backupName: "before-1.3.0",
          previousImages: null,
          writesAfterBackupLost: true,
          message: "The database was restored from the backup.",
        },
      }),
    );

    const result = screen.getByTestId("admin-update-result");
    expect(
      within(result).getByText(
        "The update failed and the system went back to the previous version.",
        { exact: true },
      ),
    ).toBeInTheDocument();
    expect(within(result).getByText("Updating the database", { exact: true })).toBeInTheDocument();
    expect(
      within(result).getByText("The database was restored from the backup.", { exact: true }),
    ).toBeInTheDocument();
    expect(
      within(result).getByText("Changes made after the backup were lost.", { exact: true }),
    ).toBeInTheDocument();
  });

  it.each([
    ["NO_UPDATE_AVAILABLE", "There is no newer version to install."],
    ["UPDATE_NOT_ALLOWED", "This version is too old to update directly. See the update guide."],
    [
      "RELEASE_SOURCE_UNREACHABLE",
      "The release source could not be reached. Check the network and try again.",
    ],
  ])("maps the apply error %s to its fixed text", async (code, message) => {
    await renderLoaded(availableUpdate);
    applyMock.mockRejectedValue(new ApiError(409, code, "raw server text"));

    fireEvent.click(updateButton());
    fireEvent.click(await screen.findByRole("button", { name: "Update now" }));

    expect(await screen.findByText(message, { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("raw server text")).not.toBeInTheDocument();
  });

  it("keeps the nightly update off by default and saves a change", async () => {
    await renderLoaded(systemUpdateWith({}));
    expect(nightlyToggle()).not.toBeChecked();
    nightlyMock.mockResolvedValue({ enabled: true });

    fireEvent.click(nightlyToggle());

    await waitFor(() => expect(nightlyToggle()).toBeChecked());
    expect(nightlyMock).toHaveBeenCalledWith(true);
  });

  it("reverts the nightly toggle and shows a notice when saving fails", async () => {
    await renderLoaded(systemUpdateWith({}));
    nightlyMock.mockRejectedValue(new Error("network down"));

    fireEvent.click(nightlyToggle());

    expect(
      await screen.findByText("Nothing was saved. Check your connection and try again.", {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(nightlyToggle()).not.toBeChecked();
  });

  it("shows the load failure inside the section only", async () => {
    updateMock.mockRejectedValue(new Error("network down"));

    render(<AdminUpdateSection />);

    expect(
      await screen.findByText("Update status could not be loaded. Try again.", { exact: true }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update system" })).not.toBeInTheDocument();
  });
});
