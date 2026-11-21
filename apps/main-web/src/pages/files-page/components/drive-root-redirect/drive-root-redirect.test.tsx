// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { DriveRootRedirect } from "./drive-root-redirect.js";

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

describe("DriveRootRedirect", () => {
  afterEach(() => {
    cleanup();
  });

  it("sends a bare drive address to the canonical drive root", () => {
    render(
      <MemoryRouter initialEntries={[`/files/${DRIVE_ID}`]}>
        <Routes>
          <Route path="/files/:driveId" element={<DriveRootRedirect />} />
          <Route path="/files/:driveId/folder" element={<p>drive root</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("drive root")).toBeInTheDocument();
  });
});
