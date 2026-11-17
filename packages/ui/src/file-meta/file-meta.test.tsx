// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FileMeta } from "./file-meta.js";

const NOW = new Date("2026-11-17T12:00:00Z");
const TODAY = new Date("2026-11-17T09:05:00Z");

describe("FileMeta", () => {
  it("joins the size and the change with a separator", () => {
    const { container } = renderWithI18n(
      <FileMeta
        id="meta"
        kind="image"
        sizeBytes={1_200_000}
        modifiedAt={TODAY}
        locale="en"
        now={NOW}
        timeZone="UTC"
      />,
    );

    expect(container).toHaveTextContent("1.2 MB·Today 09:05 AM");
  });

  it("drops the separator when the two sit apart", () => {
    const { container } = renderWithI18n(
      <FileMeta
        id="meta"
        kind="image"
        sizeBytes={1_200_000}
        modifiedAt={TODAY}
        locale="en"
        now={NOW}
        timeZone="UTC"
        spread
      />,
    );

    expect(container).not.toHaveTextContent("·");
  });

  it("shows only the change of a file without a size", () => {
    renderWithI18n(
      <FileMeta id="meta" kind="image" modifiedAt={TODAY} locale="en" now={NOW} timeZone="UTC" />,
    );

    expect(screen.queryByTestId("file-size")).not.toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("carries the id given to it", () => {
    const { container } = renderWithI18n(<FileMeta id="meta-1" kind="image" sizeBytes={5} />);

    expect(container.querySelector("#meta-1")).toBeInTheDocument();
  });
});
