// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useLeaveNotifications } from "./use-leave-notifications.js";

const useLeaveAndLocation = () => ({
  leave: useLeaveNotifications(),
  location: useLocation(),
});

const renderLeave = (initialEntries: string[], initialIndex: number) =>
  renderHook(() => useLeaveAndLocation(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    ),
  });

describe("useLeaveNotifications", () => {
  it("goes back to the previous history entry when the page has history", () => {
    const { result } = renderLeave(["/calendar", "/notifications"], 1);

    act(() => result.current.leave());

    expect(result.current.location.pathname).toBe("/calendar");
  });

  it("goes to the home page when the page was opened directly", () => {
    const { result } = renderLeave(["/notifications"], 0);

    act(() => result.current.leave());

    expect(result.current.location.pathname).toBe("/");
  });
});
