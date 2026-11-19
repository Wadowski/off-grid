// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StreamSessionState } from "../../types.js";
import { startHeartbeat } from "./start-heartbeat.js";

const INTERVAL_MS = 25_000;

const fakeResponse = () => {
  const write = vi.fn(() => true);
  const response = { write, writableEnded: false, destroyed: false };
  return { response: response as unknown as ServerResponse, write, state: response };
};

const sessionCheck = (state: StreamSessionState = "active") =>
  vi.fn(async (): Promise<StreamSessionState> => state);

describe("startHeartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes a heartbeat comment every interval and nothing before it", async () => {
    const { response, write } = fakeResponse();
    startHeartbeat(response, INTERVAL_MS, sessionCheck(), vi.fn());

    await vi.advanceTimersByTimeAsync(INTERVAL_MS - 1);
    expect(write).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenLastCalledWith(": heartbeat\n\n");

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it("stops writing when the stop function runs", async () => {
    const { response, write } = fakeResponse();
    const stop = startHeartbeat(response, INTERVAL_MS, sessionCheck(), vi.fn());

    stop();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 3);
    expect(write).not.toHaveBeenCalled();
  });

  it("ends the stream when the session check says ended", async () => {
    const { response } = fakeResponse();
    const onEnded = vi.fn();
    startHeartbeat(response, INTERVAL_MS, sessionCheck("ended"), onEnded);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("keeps the stream open when the session check is unknown", async () => {
    const { response } = fakeResponse();
    const onEnded = vi.fn();
    startHeartbeat(response, INTERVAL_MS, sessionCheck("unknown"), onEnded);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);
    expect(onEnded).not.toHaveBeenCalled();
  });

  it("skips a tick while the previous session check is still running", async () => {
    const { response, write } = fakeResponse();
    let release: () => void = () => undefined;
    const slowCheck = vi.fn(
      () =>
        new Promise<StreamSessionState>((resolve) => {
          release = () => resolve("active");
        }),
    );
    startHeartbeat(response, INTERVAL_MS, slowCheck, vi.fn());

    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);
    expect(slowCheck).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);

    release();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(slowCheck).toHaveBeenCalledTimes(2);
  });

  it("does not write to a response that has ended", async () => {
    const { response, write, state } = fakeResponse();
    state.writableEnded = true;
    startHeartbeat(response, INTERVAL_MS, sessionCheck(), vi.fn());

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(write).not.toHaveBeenCalled();
  });
});
