// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { FilesLayout } from "./files-layout.js";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="files" element={<FilesLayout />}>
          <Route index element={<p>Files index content</p>} />
          <Route path=":driveId/*" element={<p>Drive content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FilesLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the Files index content inside the layout", () => {
    renderAt("/files");

    expect(screen.getByTestId("files-layout")).toContainElement(
      screen.getByText("Files index content"),
    );
  });

  it("renders a drive route inside the layout", () => {
    renderAt("/files/drive-1/folder-2");

    expect(screen.getByTestId("files-layout")).toContainElement(screen.getByText("Drive content"));
    expect(screen.queryByText("Files index content")).not.toBeInTheDocument();
  });
});
