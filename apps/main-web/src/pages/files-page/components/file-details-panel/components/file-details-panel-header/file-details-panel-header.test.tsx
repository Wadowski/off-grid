// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDetailsPanelHeader } from "./file-details-panel-header.js";

const NAME_ID = "panel-name";

describe("FileDetailsPanelHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the file type icon and name as the labelled heading", () => {
    render(
      <FileDetailsPanelHeader
        nameId={NAME_ID}
        summary={{ name: "Trip.pdf", kind: "pdf" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("file-details-panel-name")).toHaveTextContent("Trip.pdf");
    expect(screen.getByTestId("file-details-panel-name")).toHaveAttribute("id", NAME_ID);
  });

  it("shows only the close button while no summary is known", () => {
    render(<FileDetailsPanelHeader nameId={NAME_ID} summary={null} onClose={vi.fn()} />);

    expect(screen.queryByTestId("file-details-panel-name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close details" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(<FileDetailsPanelHeader nameId={NAME_ID} summary={null} onClose={onClose} />);

    fireEvent.click(screen.getByTestId("file-details-panel-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
