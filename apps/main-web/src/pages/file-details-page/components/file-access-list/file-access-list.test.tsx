// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileAccessList } from "./file-access-list.js";

const ENTRIES = [
  { userId: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b", name: "Anna", role: "admin" as const },
  { userId: "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e", name: null, role: "member" as const },
];

describe("FileAccessList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists every entry with its role and whether it can edit", () => {
    render(
      <FileAccessList
        status="ready"
        entries={ENTRIES}
        familyDriveName="Kowalski"
        onRetry={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("Who has access")).toBeInTheDocument();
    expect(screen.getByText("Kowalski, 2 members")).toBeInTheDocument();
    const rows = screen.getAllByTestId("file-access-row");
    expect(rows).toHaveLength(2);
    expect(within(rows[0] as HTMLElement).getByText("Admin")).toBeInTheDocument();
    expect(within(rows[1] as HTMLElement).getByText("Family member")).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent("Can edit");
  });

  it("offers a retry when the people cannot be loaded", () => {
    const onRetry = vi.fn(async () => {});
    render(
      <FileAccessList status="failed" entries={[]} familyDriveName={null} onRetry={onRetry} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("The list of people could not be loaded.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the loading text while the people load", () => {
    render(
      <FileAccessList
        status="loading"
        entries={[]}
        familyDriveName={null}
        onRetry={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
