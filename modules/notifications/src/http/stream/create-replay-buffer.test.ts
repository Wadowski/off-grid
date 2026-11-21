// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { ListedNotification, NoticeSubscriber } from "../../types.js";
import { createReplayBuffer } from "./create-replay-buffer.js";

const ONE = "9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f";
const TWO = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const THREE = "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e";

const notice = (id: string): ListedNotification => ({
  id,
  type: "password-changed",
  category: "account-security",
  data: {},
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
});

const recordingTarget = (): NoticeSubscriber & { sent: string[] } => {
  const sent: string[] = [];
  return {
    sent,
    send: vi.fn(async (item: ListedNotification) => {
      sent.push(item.id);
    }),
    close: vi.fn(),
  };
};

describe("createReplayBuffer", () => {
  it("holds live notices until the buffer is flushed", async () => {
    const end = vi.fn();
    const { subscriber } = createReplayBuffer(10, end);
    const target = recordingTarget();

    await subscriber.send(notice(ONE));

    expect(target.send).not.toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();
  });

  it("sends buffered notices in arrival order on flush", async () => {
    const { subscriber, flush } = createReplayBuffer(10, vi.fn());
    const target = recordingTarget();
    await subscriber.send(notice(TWO));
    await subscriber.send(notice(ONE));

    await flush(new Set(), target);

    expect(target.sent).toEqual([TWO, ONE]);
  });

  it("drops buffered notices whose id was already replayed", async () => {
    const { subscriber, flush } = createReplayBuffer(10, vi.fn());
    const target = recordingTarget();
    await subscriber.send(notice(ONE));
    await subscriber.send(notice(TWO));

    await flush(new Set([ONE]), target);

    expect(target.sent).toEqual([TWO]);
  });

  it("sends a notice only once when it is buffered twice", async () => {
    const { subscriber, flush } = createReplayBuffer(10, vi.fn());
    const target = recordingTarget();
    await subscriber.send(notice(ONE));
    await subscriber.send(notice(ONE));

    await flush(new Set(), target);

    expect(target.sent).toEqual([ONE]);
  });

  it("passes notices straight through after the flush", async () => {
    const { subscriber, flush } = createReplayBuffer(10, vi.fn());
    const target = recordingTarget();
    await flush(new Set(), target);

    await subscriber.send(notice(THREE));

    expect(target.sent).toEqual([THREE]);
  });

  it("drops a live notice after the flush when its id was already replayed", async () => {
    const { subscriber, flush } = createReplayBuffer(10, vi.fn());
    const target = recordingTarget();
    await flush(new Set([ONE]), target);

    await subscriber.send(notice(ONE));
    await subscriber.send(notice(TWO));

    expect(target.sent).toEqual([TWO]);
  });

  it("ends the stream when more notices arrive than the buffer holds", async () => {
    const end = vi.fn();
    const { subscriber, flush } = createReplayBuffer(1, end);
    const target = recordingTarget();
    await subscriber.send(notice(ONE));

    await subscriber.send(notice(TWO));
    await flush(new Set(), target);

    expect(end).toHaveBeenCalledTimes(1);
    expect(target.sent).toEqual([ONE]);
  });

  it("ends the stream when the hub closes the subscriber", () => {
    const end = vi.fn();
    const { subscriber } = createReplayBuffer(10, end);

    subscriber.close();

    expect(end).toHaveBeenCalledTimes(1);
  });
});
