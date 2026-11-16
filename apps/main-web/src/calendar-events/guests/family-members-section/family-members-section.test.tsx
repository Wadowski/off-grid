// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuestCandidatesState } from "../types.js";
import { FamilyMembersSection } from "./family-members-section.js";

const BEN = "7c2e9d1b-4a6f-4b8e-9c3d-2f1a0b9e8d7c";
const CARA = "1f0e2d3c-4b5a-4968-8777-665544332211";
const OTHER = "9a8b7c6d-5e4f-4321-8765-43210fedcba9";

const readyState = (overrides: Partial<GuestCandidatesState> = {}): GuestCandidatesState => ({
  status: "ready",
  candidates: [
    { userId: BEN, name: "Ben", familyId: "family-smiths", familyName: "The Smiths" },
    { userId: CARA, name: undefined, familyId: "family-smiths", familyName: "The Smiths" },
    { userId: OTHER, name: "Olu", familyId: "family-home", familyName: "Home" },
  ],
  retry: vi.fn(),
  ...overrides,
});

describe("FamilyMembersSection", () => {
  afterEach(() => cleanup());

  it("shows the family name collapsed, with a count of its members", () => {
    render(<FamilyMembersSection state={readyState()} familyId="family-smiths" />);

    const toggle = screen.getByTestId("event-family-toggle");
    expect(toggle).toHaveTextContent("The Smiths");
    expect(toggle).toHaveTextContent("2");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("event-family-members")).not.toBeInTheDocument();
  });

  it("lists every member of the family when expanded, and only those", () => {
    render(<FamilyMembersSection state={readyState()} familyId="family-smiths" />);

    fireEvent.click(screen.getByTestId("event-family-toggle"));

    expect(screen.getByTestId("event-family-toggle")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId(`event-family-member-${BEN}`)).toHaveTextContent("Ben");
    expect(screen.getByTestId(`event-family-member-${CARA}`)).toHaveTextContent("Guest");
    expect(screen.queryByTestId(`event-family-member-${OTHER}`)).not.toBeInTheDocument();
  });

  it("shows the failure with a retry when the members cannot be loaded", () => {
    const retry = vi.fn();
    render(
      <FamilyMembersSection
        state={readyState({ status: "failed", candidates: [], retry })}
        familyId="family-smiths"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
