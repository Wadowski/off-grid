// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDetailsStatus } from "./file-details-status.js";

const renderStatus = (props: Parameters<typeof FileDetailsStatus>[0]) =>
  render(
    <MemoryRouter>
      <FileDetailsStatus {...props} />
    </MemoryRouter>,
  );

describe("FileDetailsStatus", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the loading text while the file loads", () => {
    renderStatus({ status: "loading" });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows the mapped error and retries on request", async () => {
    const onRetry = vi.fn(async () => {});
    renderStatus({ status: "failed", errorTextId: "files.errors.notFound", onRetry });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This file or folder is no longer available.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
