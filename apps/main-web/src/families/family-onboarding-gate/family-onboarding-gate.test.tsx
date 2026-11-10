// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { FamiliesContext } from "../../types.js";
import { FamilyOnboardingGate } from "./family-onboarding-gate.js";

const FAMILY = {
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Lakeside",
  role: "admin" as const,
  accent: "blue" as const,
  purpose: "household" as const,
};

const familiesContext = (overrides: Partial<FamiliesContext>): FamiliesContext => ({
  families: [],
  listStatus: "ready",
  createStatus: "idle",
  submitFamily: async () => false,
  refreshFamilies: async () => undefined,
  ...overrides,
});

const renderGateAt = (path: string, context: FamiliesContext) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={context} />}>
          <Route element={<FamilyOnboardingGate />}>
            <Route path="/" element={<p>Shell</p>} />
            <Route path="/welcome" element={<p>First family</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FamilyOnboardingGate", () => {
  it("does not show the app while the family list is still loading", () => {
    renderGateAt("/", familiesContext({ listStatus: "loading" }));

    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(screen.queryByText("Shell")).toBeNull();
    expect(screen.queryByText("First family")).toBeNull();
  });

  it("sends a person with no family to the first-family screen once the list is ready", () => {
    renderGateAt("/", familiesContext({ listStatus: "ready", families: [] }));

    expect(screen.getByText("First family")).toBeTruthy();
  });

  it("shows the app once the person has a family", () => {
    renderGateAt("/", familiesContext({ listStatus: "ready", families: [FAMILY] }));

    expect(screen.getByText("Shell")).toBeTruthy();
  });
});
