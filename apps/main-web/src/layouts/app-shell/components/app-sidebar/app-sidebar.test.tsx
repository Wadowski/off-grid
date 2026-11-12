// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppSidebar } from "./app-sidebar.js";

describe("AppSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps the main navigation and leaves the calendar list out", () => {
    render(
      <MemoryRouter>
        <AppSidebar
          user={{ name: "Ada", email: "ada@example.com", role: "member" }}
          families={[]}
          onSignOut={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("app-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-calendar-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("calendar-sidebar")).not.toBeInTheDocument();
  });
});
