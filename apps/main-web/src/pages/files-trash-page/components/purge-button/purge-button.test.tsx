// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PurgeButton } from "./purge-button.js";

describe("PurgeButton", () => {
  it("names the item it deletes permanently", () => {
    render(<PurgeButton name="Old receipt.pdf" disabled={false} compact onPurge={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Delete Old receipt.pdf permanently" }),
    ).toBeInTheDocument();
  });

  it("shows its text on a desktop row", () => {
    render(
      <PurgeButton name="Old receipt.pdf" disabled={false} compact={false} onPurge={vi.fn()} />,
    );

    expect(screen.getByTestId("trash-purge")).toHaveTextContent("Delete permanently");
  });

  it("calls onPurge when pressed", () => {
    const onPurge = vi.fn();
    render(<PurgeButton name="Old receipt.pdf" disabled={false} compact onPurge={onPurge} />);

    fireEvent.click(screen.getByTestId("trash-purge"));

    expect(onPurge).toHaveBeenCalledOnce();
  });

  it("is disabled while another trash action runs", () => {
    render(<PurgeButton name="Old receipt.pdf" disabled compact onPurge={vi.fn()} />);

    expect(screen.getByTestId("trash-purge")).toBeDisabled();
  });
});
