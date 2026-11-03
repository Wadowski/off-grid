// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../app.js";

describe("app shell", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders landmarks and has no axe violations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ families: [] }), { status: 200 })),
    );
    const { container } = render(<App />);
    await screen.findByTestId("family-list-empty");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByTestId("app-nav")).toBeInTheDocument();

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  }, 15_000);
});
