// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FileActivityEntry } from "../../../../files/types.js";
import { FileActivityList } from "./file-activity-list.js";

const ENTRIES: readonly FileActivityEntry[] = [
  {
    id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c20" as FileActivityEntry["id"],
    number: 2,
    createdAt: new Date("2026-03-04T05:06:07Z"),
    name: "Ben",
  },
  {
    id: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c10" as FileActivityEntry["id"],
    number: 1,
    createdAt: new Date("2026-03-01T08:00:00Z"),
    name: "Anna",
  },
];

describe("FileActivityList", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists the entries in the order given", () => {
    render(<FileActivityList status="ready" entries={ENTRIES} onRetry={vi.fn(async () => {})} />);

    const rows = screen.getAllByTestId("file-activity-row");
    expect(rows[0]).toHaveTextContent("Ben saved version 2");
    expect(rows[1]).toHaveTextContent("Anna added the file");
    expect(within(rows[0] as HTMLElement).getByText(/2026|Mar/)).toBeInTheDocument();
  });

  it("names a former member when the author cannot be resolved", () => {
    render(
      <FileActivityList
        status="ready"
        entries={[{ ...ENTRIES[0], name: null } as FileActivityEntry]}
        onRetry={vi.fn(async () => {})}
      />,
    );

    expect(screen.getByText("A former member saved version 2")).toBeInTheDocument();
  });

  it("shows the empty message when there is no activity", () => {
    render(<FileActivityList status="ready" entries={[]} onRetry={vi.fn(async () => {})} />);

    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  it("offers a retry when the activity cannot be loaded", () => {
    const onRetry = vi.fn(async () => {});
    render(<FileActivityList status="failed" entries={[]} onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Activity could not be loaded.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
