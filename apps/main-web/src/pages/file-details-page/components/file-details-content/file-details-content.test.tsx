// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { driveIdSchema } from "@offgrid/contracts";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FileDetailsContent } from "./file-details-content.js";

describe("FileDetailsContent", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the loading text while the file is loading", () => {
    render(
      <MemoryRouter>
        <FileDetailsContent
          driveId={driveIdSchema.parse("3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d")}
          details={{
            file: null,
            breadcrumbs: [],
            status: "loading",
            errorTextId: null,
            refresh: async () => {},
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
