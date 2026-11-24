// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDetailsTabs } from "./file-details-tabs.js";

describe("FileDetailsTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the activity count beside the Activity tab", () => {
    render(<FileDetailsTabs value="details" activityCount={3} onChange={vi.fn()} />);

    expect(screen.getByTestId("file-details-activity-count")).toHaveTextContent("3");
    expect(screen.getByTestId("segmented-option-activity")).toHaveTextContent("Activity");
  });

  it("shows no count while the activity is not loaded", () => {
    render(<FileDetailsTabs value="details" activityCount={null} onChange={vi.fn()} />);

    expect(screen.queryByTestId("file-details-activity-count")).not.toBeInTheDocument();
  });

  it("reports the tab that is chosen", () => {
    const onChange = vi.fn();
    render(<FileDetailsTabs value="details" activityCount={1} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("segmented-option-activity"));

    expect(onChange).toHaveBeenCalledWith("activity");
  });
});
