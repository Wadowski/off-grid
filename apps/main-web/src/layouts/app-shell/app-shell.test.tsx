// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../app.js";
import { resetSessionForTests } from "../../session/session-actions.js";
import { signedInStartup } from "../../test-support/session-responses.js";

describe("app shell", () => {
  beforeEach(() => {
    resetSessionForTests();
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders landmarks and has no axe violations", async () => {
    const responses = [...signedInStartup(), { status: 200, body: { families: [] } }];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const next = responses.shift();
        if (next === undefined) {
          throw new Error("Unexpected request");
        }
        return new Response(JSON.stringify(next.body), { status: next.status });
      }),
    );
    const { container } = render(<App />);
    await screen.findByTestId("family-list-empty");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByTestId("app-nav")).toBeInTheDocument();

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });

    expect(results.violations).toEqual([]);
  });
});
