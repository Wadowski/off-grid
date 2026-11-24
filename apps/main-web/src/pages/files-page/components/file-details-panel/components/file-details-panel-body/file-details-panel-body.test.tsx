// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileSchema } from "@offgrid/contracts";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { FileEntry, Drive, RegularFileEntry } from "../../../../../../files/types.js";
import { FileDetailsPanelBody } from "./file-details-panel-body.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as Drive["id"];
const FOLDER_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a" as FileEntry["id"];
const FILE_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const VERSION_ID = "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";

const FILE = fileSchema.parse({
  id: FILE_ID,
  driveId: DRIVE_ID,
  parentId: null,
  name: "Trip.pdf",
  version: 3,
  createdAt: "2026-03-01T08:00:00.000Z",
  updatedAt: "2026-03-04T05:06:07.000Z",
  deletedAt: null,
  isFolder: false,
  mimeType: "application/pdf",
  size: 2048,
  currentVersionId: VERSION_ID,
}) as RegularFileEntry;

describe("FileDetailsPanelBody", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the type, size, modified, created and location rows without version or owner", () => {
    render(
      <FileDetailsPanelBody versionsSection={null}
        file={FILE}
        breadcrumbs={[
          { kind: "drive", id: DRIVE_ID, name: "Personal" },
          { kind: "folder", id: FOLDER_ID, name: "Photos" },
        ]}
      />,
    );

    expect(screen.getByTestId("file-details-property-type")).toHaveTextContent("PDF");
    expect(screen.getByTestId("file-details-property-size")).toHaveTextContent("2.0 KB");
    expect(screen.getByTestId("file-details-property-modified")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-property-created")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-property-location")).toHaveTextContent(
      "Personal › Photos",
    );
    expect(screen.queryByTestId("file-details-property-version")).not.toBeInTheDocument();
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();
  });

  it("labels the properties section with its uppercase heading and lists the label before the value", () => {
    render(<FileDetailsPanelBody versionsSection={null} file={FILE} breadcrumbs={[]} />);

    const section = screen.getByRole("region", { name: "File properties" });
    const row = screen.getByTestId("file-details-property-size");
    expect(section).toContainElement(row);
    expect(row.querySelector("dt")).toHaveTextContent("Size");
    expect(row.querySelector("dd")).toHaveTextContent("2.0 KB");
  });
});
