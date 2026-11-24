// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema } from "@offgrid/contracts";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import type { FileDetailsScreenState } from "../../../../files/types.js";
import { FileDetailsContent } from "./file-details-content.js";

const DRIVE_ID = driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d");

const screenWithoutFile = (): FileDetailsScreenState => ({
  details: {
    file: null,
    breadcrumbs: [],
    status: "loading",
    errorTextId: null,
    refresh: async () => {},
  },
  versions: { versions: [], status: "loading", errorTextId: null, refresh: async () => {} },
  drive: null,
  drivesStatus: "loading",
  members: [],
  membersStatus: "ready",
  refreshMembers: async () => {},
  viewer: null,
});

describe("FileDetailsContent", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the loading text while the file is loading", () => {
    render(
      <MemoryRouter>
        <FileDetailsContent driveId={DRIVE_ID} screen={screenWithoutFile()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
