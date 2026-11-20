// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { EventEmitter } from "node:events";
import type { ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import type { ListedNotification } from "../../types.js";
import { createStreamSubscriber } from "./create-stream-subscriber.js";

const notice: ListedNotification = {
  id: "9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f",
  type: "password-changed",
  category: "account-security",
  data: {},
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
};

const fakeResponse = (writeReturns = true) => {
  const emitter = new EventEmitter() as EventEmitter & {
    destroyed: boolean;
    writableEnded: boolean;
    write: ReturnType<typeof vi.fn>;
  };
  emitter.destroyed = false;
  emitter.writableEnded = false;
  emitter.write = vi.fn(() => writeReturns);
  return { response: emitter as unknown as ServerResponse, raw: emitter };
};

describe("createStreamSubscriber", () => {
  it("writes the notice as a notification frame", async () => {
    const { response, raw } = fakeResponse();
    const subscriber = createStreamSubscriber(response, vi.fn());

    await subscriber.send(notice);

    expect(raw.write).toHaveBeenCalledWith(
      `event: notification\nid: ${notice.id}\ndata: ${JSON.stringify(notice)}\n\n`,
    );
  });

  it("waits for drain when the socket buffer is full", async () => {
    const { response, raw } = fakeResponse(false);
    const subscriber = createStreamSubscriber(response, vi.fn());
    let sent = false;

    const pending = subscriber.send(notice).then(() => {
      sent = true;
    });
    await Promise.resolve();
    expect(sent).toBe(false);

    raw.emit("drain");
    await pending;
    expect(sent).toBe(true);
  });

  it("rejects when the response was destroyed", async () => {
    const { response, raw } = fakeResponse();
    raw.destroyed = true;
    const subscriber = createStreamSubscriber(response, vi.fn());

    await expect(subscriber.send(notice)).rejects.toThrow("notification stream closed");
    expect(raw.write).not.toHaveBeenCalled();
  });

  it("rejects a waiting send when the response closes before drain", async () => {
    const { response, raw } = fakeResponse(false);
    const subscriber = createStreamSubscriber(response, vi.fn());

    const pending = subscriber.send(notice);
    raw.emit("close");

    await expect(pending).rejects.toThrow("notification stream closed");
  });

  it("ends the stream through the given end function when closed", () => {
    const { response } = fakeResponse();
    const endStream = vi.fn();
    const subscriber = createStreamSubscriber(response, endStream);

    subscriber.close();

    expect(endStream).toHaveBeenCalledTimes(1);
  });
});
