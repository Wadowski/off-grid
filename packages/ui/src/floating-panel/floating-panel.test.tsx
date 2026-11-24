// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FloatingPanel } from "./floating-panel.js";

describe("FloatingPanel", () => {
  it("renders a named region that is not modal", () => {
    render(
      <FloatingPanel placement="corner" labelledBy="panel-title" testId="panel">
        <h2 id="panel-title">Uploads</h2>
        <button type="button">Minimize</button>
      </FloatingPanel>,
    );

    const region = screen.getByRole("region", { name: "Uploads" });
    expect(region).toHaveAttribute("data-testid", "panel");
    expect(region).not.toHaveAttribute("aria-modal");
  });

  it("does not move focus when it opens", () => {
    render(
      <main>
        <button type="button">Upload</button>
        <FloatingPanel placement="corner" labelledBy="panel-title">
          <h2 id="panel-title">Uploads</h2>
        </FloatingPanel>
      </main>,
    );

    expect(document.activeElement).toBe(document.body);
  });

  it("hands focus to the main landmark when it unmounts with focus inside", () => {
    const { rerender } = render(
      <main tabIndex={-1} data-testid="main">
        <FloatingPanel placement="corner" labelledBy="panel-title">
          <button type="button">Minimize</button>
        </FloatingPanel>
      </main>,
    );
    screen.getByRole("button", { name: "Minimize" }).focus();

    rerender(<main tabIndex={-1} data-testid="main" />);

    expect(document.activeElement).toBe(screen.getByTestId("main"));
  });

  it("calls onEscape when Escape is pressed inside the panel", () => {
    const onEscape = vi.fn();
    render(
      <FloatingPanel placement="sheet" labelledBy="panel-title" onEscape={onEscape}>
        <h2 id="panel-title">Uploads</h2>
        <button type="button">Minimize</button>
      </FloatingPanel>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Minimize" }), { key: "Escape" });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const onEscape = vi.fn();
    render(
      <FloatingPanel placement="sheet" labelledBy="panel-title" onEscape={onEscape}>
        <h2 id="panel-title">Uploads</h2>
      </FloatingPanel>,
    );

    fireEvent.keyDown(screen.getByRole("region"), { key: "Enter" });

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("moves focus to the main landmark when it unmounts while focus is inside", () => {
    const { rerender } = render(
      <main tabIndex={-1} data-testid="main">
        <FloatingPanel placement="corner" labelledBy="panel-title">
          <h2 id="panel-title">Uploads</h2>
          <button type="button">Close</button>
        </FloatingPanel>
      </main>,
    );
    screen.getByRole("button", { name: "Close" }).focus();

    rerender(<main tabIndex={-1} data-testid="main" />);

    expect(document.activeElement).toBe(screen.getByTestId("main"));
  });
});
