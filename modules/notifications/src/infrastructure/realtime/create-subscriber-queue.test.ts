// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { ListedNotification, NoticeSubscriber } from "../../types.js";
import { createSubscriberQueue } from "./create-subscriber-queue.js";

const notice = (id: string): ListedNotification => ({
  id,
  type: "password-changed",
  category: "account-security",
  data: {},
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
});

const deferred = () => {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

const flushMicrotasks = async (): Promise<void> => {
  for (let turn = 0; turn < 10; turn += 1) {
    await Promise.resolve();
  }
};

describe("createSubscriberQueue", () => {
  it("sends queued notices one at a time, in push order", async () => {
    const sent: string[] = [];
    const gate = deferred();
    const subscriber: NoticeSubscriber = {
      send: async (item) => {
        await gate.promise;
        sent.push(item.id);
      },
      close: vi.fn(),
    };
    const queue = createSubscriberQueue(subscriber, 5, vi.fn());

    queue.push(notice("first"));
    queue.push(notice("second"));
    gate.resolve();
    await flushMicrotasks();

    expect(sent).toEqual(["first", "second"]);
  });

  it("reports overflow once pending notices, including the one being sent, reach the limit", () => {
    const subscriber: NoticeSubscriber = {
      send: () => new Promise<void>(() => undefined),
      close: vi.fn(),
    };
    const queue = createSubscriberQueue(subscriber, 2, vi.fn());

    expect(queue.push(notice("first"))).toBe("queued");
    expect(queue.push(notice("second"))).toBe("queued");
    expect(queue.push(notice("third"))).toBe("overflow");
  });

  it("reports stopped after stop and sends nothing more", async () => {
    const send = vi.fn(async () => undefined);
    const queue = createSubscriberQueue({ send, close: vi.fn() }, 5, vi.fn());

    queue.stop();

    expect(queue.push(notice("late"))).toBe("stopped");
    await flushMicrotasks();
    expect(send).not.toHaveBeenCalled();
  });

  it("reports a failed send once and stops sending", async () => {
    const onSendFailure = vi.fn();
    const send = vi.fn(async () => {
      throw new TypeError("broken stream");
    });
    const queue = createSubscriberQueue({ send, close: vi.fn() }, 5, onSendFailure);

    queue.push(notice("first"));
    queue.push(notice("second"));
    await flushMicrotasks();

    expect(send).toHaveBeenCalledTimes(1);
    expect(onSendFailure).toHaveBeenCalledTimes(1);
    expect(onSendFailure.mock.calls[0]?.[0]).toBeInstanceOf(TypeError);
  });

  it("does not report a failure that happens after stop", async () => {
    const onSendFailure = vi.fn();
    const gate = deferred();
    const send = vi.fn(async () => {
      await gate.promise;
      throw new Error("late");
    });
    const queue = createSubscriberQueue({ send, close: vi.fn() }, 5, onSendFailure);

    queue.push(notice("first"));
    queue.stop();
    gate.resolve();
    await flushMicrotasks();

    expect(onSendFailure).not.toHaveBeenCalled();
  });
});
