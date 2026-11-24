// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FileProperties } from "./file-properties.js";

describe("FileProperties", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists every row with its label and value", () => {
    render(
      <FileProperties
        rows={[
          { key: "type", labelTextId: "files.details.type", value: "PDF" },
          { key: "size", labelTextId: "files.details.size", value: "2.0 KB" },
        ]}
      />,
    );

    expect(screen.getByText("File properties")).toBeInTheDocument();
    expect(screen.getByTestId("file-details-property-type")).toHaveTextContent("Type");
    expect(screen.getByTestId("file-details-property-type")).toHaveTextContent("PDF");
    expect(screen.getByTestId("file-details-property-size")).toHaveTextContent("2.0 KB");
  });
});
