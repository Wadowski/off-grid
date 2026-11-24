// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadQueueLiveRegion } from "./upload-queue-live-region.js";

describe("UploadQueueLiveRegion", () => {
  it("announsome politely when an upload fails and gives the reason", () => {
    render(
      <UploadQueueLiveRegion
        announcement={{
          sequence: 2,
          textId: "files.upload.announceFailed",
          name: "Beach.jpg",
          reasonTextId: "files.errors.payloadTooLarge",
        }}
      />,
    );

    const region = screen.getByTestId("upload-announcer");
    expect(region).toHaveAttribute("role", "status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Beach.jpg could not be uploaded.");
    expect(region).toHaveTextContent("This file is too large to upload.");
  });

  it("is empty before any upload has changed state", () => {
    render(<UploadQueueLiveRegion announcement={null} />);

    expect(screen.getByTestId("upload-announcer")).toBeEmptyDOMElement();
  });
});
