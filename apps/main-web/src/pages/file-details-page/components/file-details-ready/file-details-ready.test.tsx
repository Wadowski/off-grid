// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { breadcrumbSchema, driveIdSchema, fileSchema } from "@offgrid/contracts";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { RegularFileEntry } from "../../../../files/types.js";
import { FileDetailsReady } from "./file-details-ready.js";

const DRIVE_ID = driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");
const PHOTOS_ID = "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a";
const FILE_ID = "9b0c1d2e-3f4a-4b5c-8d6e-7f8a9b0c1d2e";

const nestedFile = () =>
  fileSchema.parse({
    id: FILE_ID,
    driveId: DRIVE_ID,
    parentId: PHOTOS_ID,
    name: "Beach.jpg",
    version: 2,
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-04T05:06:07.000Z",
    deletedAt: null,
    isFolder: false,
    mimeType: "image/jpeg",
    size: 2048,
    currentVersionId: "8a9b0c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d",
  }) as RegularFileEntry;

const BREADCRUMBS = [
  breadcrumbSchema.parse({ kind: "drive", id: DRIVE_ID, name: "Personal" }),
  breadcrumbSchema.parse({ kind: "folder", id: PHOTOS_ID, name: "Photos" }),
  breadcrumbSchema.parse({ kind: "folder", id: FILE_ID, name: "Beach.jpg" }),
];

describe("FileDetailsReady", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the file name, its properties and a location link to the folder above", () => {
    render(
      <MemoryRouter>
        <FileDetailsReady
          file={nestedFile()}
          breadcrumbs={BREADCRUMBS}
          backTarget={{ to: `/files/${DRIVE_ID}/folder/${PHOTOS_ID}`, name: "Photos" }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("file-details-name")).toHaveTextContent("Beach.jpg");
    expect(screen.getByTestId("file-details-property-type")).toHaveTextContent("Image");
    expect(screen.getByTestId("file-details-property-version")).toHaveTextContent("Version 2");
    expect(screen.getByTestId("file-details-location")).toHaveTextContent("Personal › Photos");
    expect(screen.getByTestId("file-details-location")).toHaveAttribute(
      "href",
      `/files/${DRIVE_ID}/folder/${PHOTOS_ID}`,
    );
  });
});
