// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SystemUpdate } from "./types.js";
import { webSystemClient } from "../../../../api/web-api-client.js";
import { UPDATE_STATUS_POLL_INTERVAL_MS } from "./constants.js";
import { useUpdateStatus } from "./use-update-status.js";

vi.mock("../../../../api/web-api-client.js", () => ({
  webSystemClient: { update: vi.fn() },
}));

const updateMock = vi.mocked(webSystemClient.update);

const flushInitialLoad = () => act(() => vi.advanceTimersByTimeAsync(0));

const systemUpdateWith = (overrides: Partial<SystemUpdate>): SystemUpdate => ({
  currentVersion: "1.2.3",
  latestVersion: "1.2.3",
  updateAvailable: false,
  updateAllowed: true,
  checkedAt: "2026-11-20T10:00:00.000Z",
  runState: "idle",
  lastRun: null,
  running: false,
  nightlyEnabled: false,
  ...overrides,
});

describe("useUpdateStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    updateMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads the status once and does not poll while no update runs", async () => {
    updateMock.mockResolvedValue(systemUpdateWith({}));

    const { result } = renderHook(() => useUpdateStatus());
    await flushInitialLoad();
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS * 3));

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual({
      status: "ready",
      update: systemUpdateWith({}),
      unreachable: false,
    });
  });

  it("polls at the poll interval while an update runs and stops when it finishes", async () => {
    updateMock
      .mockResolvedValueOnce(systemUpdateWith({ running: true, runState: "running" }))
      .mockResolvedValueOnce(systemUpdateWith({ running: false, runState: "succeeded" }));

    renderHook(() => useUpdateStatus());
    await flushInitialLoad();
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS));
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS * 3));

    expect(updateMock).toHaveBeenCalledTimes(2);
  });

  it("keeps polling after a failed poll and marks the server as unreachable until it answers", async () => {
    updateMock
      .mockResolvedValueOnce(systemUpdateWith({ running: true, runState: "running" }))
      .mockRejectedValueOnce(new Error("restarting"))
      .mockResolvedValueOnce(systemUpdateWith({ running: true, runState: "running" }));

    const { result } = renderHook(() => useUpdateStatus());
    await flushInitialLoad();
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS));

    expect(result.current.state).toMatchObject({ status: "ready", unreachable: true });

    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS));

    expect(updateMock).toHaveBeenCalledTimes(3);
    expect(result.current.state).toMatchObject({ status: "ready", unreachable: false });
  });

  it("reports a failed status when the first load fails and does not poll", async () => {
    updateMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useUpdateStatus());
    await flushInitialLoad();
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS * 3));

    expect(result.current.state).toEqual({ status: "failed" });
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it("shows the update as running right after apply and polls until the server says it ended", async () => {
    updateMock
      .mockResolvedValueOnce(systemUpdateWith({ latestVersion: "1.3.0", updateAvailable: true }))
      .mockResolvedValueOnce(systemUpdateWith({ running: false }));

    const { result } = renderHook(() => useUpdateStatus());
    await flushInitialLoad();
    act(() => result.current.markRunning());

    expect(result.current.state).toMatchObject({ status: "ready", update: { running: true } });
    await act(() => vi.advanceTimersByTimeAsync(UPDATE_STATUS_POLL_INTERVAL_MS));

    expect(result.current.state).toMatchObject({ status: "ready", update: { running: false } });
  });
});
