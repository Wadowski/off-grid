// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadFile } from "../../../../files/files-api.js";
import { setSessionState } from "../../../../session/set-session-state.js";
import { useUploadQueueContext } from "../../../../uploads/index.js";
import { UploadQueueProvider } from "../../../../uploads/index.js";
import { UploadQueuePanel } from "./upload-queue-panel.js";

vi.mock("../../../../files/files-api.js", () => ({ uploadFile: vi.fn() }));

const TARGET = {
  driveId: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as never,
  folderId: null,
};

const EnqueueButton = ({ path }: { path: string }) => {
  const queue = useUploadQueueContext();
  return (
    <button type="button" onClick={() => queue.enqueue([new File(["x"], path)], TARGET)}>
      add {path}
    </button>
  );
};

const GoToNotifications = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate("/notifications")}>
      go to notifications
    </button>
  );
};

const renderAt = (route: string, withNavigation = false) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <UploadQueueProvider>
        <EnqueueButton path="Holiday.txt" />
        {withNavigation ? <GoToNotifications /> : null}
        <UploadQueuePanel />
        <main tabIndex={-1} data-testid="main" />
      </UploadQueueProvider>
    </MemoryRouter>,
  );

const addFile = () => {
  fireEvent.click(screen.getByRole("button", { name: "add Holiday.txt" }));
};

beforeEach(() => {
  vi.mocked(uploadFile).mockReturnValue(new Promise(() => undefined) as never);
  setSessionState({
    status: "signedIn",
    user: { id: "u", displayName: "Anna", email: "anna@example.test", instanceRole: "member" },
    families: [],
    activeFamilyId: "a0000000-0000-4000-8000-000000000001",
  } as never);
});

afterEach(() => {
  setSessionState({ status: "loading" });
  vi.clearAllMocks();
});

describe("UploadQueuePanel", () => {
  it("is not shown while the queue is empty", () => {
    renderAt("/notifications");

    expect(screen.queryByTestId("upload-queue-panel")).toBeNull();
  });

  it("starts collapsed on the Files page", () => {
    renderAt("/files");
    addFile();

    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("upload-queue-panel-row")).toBeNull();
  });

  it("opens expanded on another page", () => {
    renderAt("/notifications");
    addFile();

    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByTestId("upload-queue-panel-row")).toHaveTextContent("Holiday.txt");
  });

  it("expands when the person leaves the Files page with uploads in the queue", () => {
    renderAt("/files", true);
    addFile();
    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "go to notifications" }));

    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("toggles between expanded and minimized", () => {
    renderAt("/notifications");
    addFile();

    fireEvent.click(screen.getByTestId("upload-queue-panel-toggle"));
    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    fireEvent.click(screen.getByTestId("upload-queue-panel-toggle"));
    expect(screen.getByTestId("upload-queue-panel-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("minimizes on Escape and returns focus to the toggle", () => {
    renderAt("/notifications");
    addFile();
    const toggle = screen.getByTestId("upload-queue-panel-toggle");
    act(() => {
      toggle.focus();
    });

    fireEvent.keyDown(toggle, { key: "Escape" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
  });

  it("does not offer close while an upload is running", () => {
    renderAt("/notifications");
    addFile();

    expect(screen.queryByTestId("upload-queue-panel-close")).toBeNull();
  });

  it("has a single live region for the announcements", () => {
    renderAt("/notifications");
    addFile();

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByTestId("upload-announcer")).toHaveTextContent("Uploading Holiday.txt");
  });
});
