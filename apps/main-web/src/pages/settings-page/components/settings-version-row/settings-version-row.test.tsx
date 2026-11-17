// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { webSystemClient } from "../../../../api/web-api-client.js";
import { SettingsVersionRow } from "./settings-version-row.js";

vi.mock("../../../../api/web-api-client.js", () => ({
  webSystemClient: { version: vi.fn() },
}));

const versionMock = vi.mocked(webSystemClient.version);

describe("SettingsVersionRow", () => {
  beforeEach(() => {
    versionMock.mockReset();
  });

  it("shows nothing while the version is loading", () => {
    versionMock.mockReturnValue(new Promise(() => undefined));

    render(<SettingsVersionRow />);

    expect(screen.queryByTestId("settings-version")).not.toBeInTheDocument();
  });

  it("shows the running version once the server has answered", async () => {
    versionMock.mockResolvedValue({ version: "1.2.3" });

    render(<SettingsVersionRow />);

    expect(await screen.findByTestId("settings-version")).toHaveTextContent(
      "Offgrid version 1.2.3",
    );
  });

  it("says the version is unavailable when the server cannot answer", async () => {
    versionMock.mockRejectedValue(new Error("network down"));

    render(<SettingsVersionRow />);

    expect(await screen.findByTestId("settings-version")).toHaveTextContent("Version unavailable");
  });
});
