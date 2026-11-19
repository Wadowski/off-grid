// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { InboxNotice, NoticeSubscriber, NotificationHub, SubscriberEntry } from "../types.js";
import { closeSubscriberSafely } from "./close-subscriber-safely.js";
import { createSubscriberQueue } from "./create-subscriber-queue.js";
import { errorTypeName } from "./error-type-name.js";

export const createNotificationHub = (logger: Logger, queueLimit: number): NotificationHub => {
  const entriesByUser = new Map<string, Set<SubscriberEntry>>();
  let closed = false;

  const removeEntry = (entry: SubscriberEntry): void => {
    entry.queue.stop();
    const entries = entriesByUser.get(entry.userId);
    entries?.delete(entry);
    if (entries?.size === 0) {
      entriesByUser.delete(entry.userId);
    }
  };

  const closeEntry = (entry: SubscriberEntry): void => {
    removeEntry(entry);
    closeSubscriberSafely(entry.subscriber, logger);
  };

  const failEntry = (entry: SubscriberEntry, error: unknown): void => {
    logger.warn("notification stream closed after a failed send", {
      error: errorTypeName(error),
    });
    closeEntry(entry);
  };

  const createEntry = (userId: string, subscriber: NoticeSubscriber): SubscriberEntry => {
    const entry: SubscriberEntry = {
      userId,
      subscriber,
      queue: createSubscriberQueue(subscriber, queueLimit, (error: unknown) =>
        failEntry(entry, error),
      ),
    };
    return entry;
  };

  const subscribe = (userId: string, subscriber: NoticeSubscriber): (() => void) => {
    if (closed) {
      closeSubscriberSafely(subscriber, logger);
      return () => undefined;
    }
    const entry = createEntry(userId, subscriber);
    const entries = entriesByUser.get(userId) ?? new Set<SubscriberEntry>();
    entries.add(entry);
    entriesByUser.set(userId, entries);
    return () => removeEntry(entry);
  };

  const publishToEntry = (entry: SubscriberEntry, notice: InboxNotice): void => {
    if (entry.queue.push(notice) === "overflow") {
      logger.warn("notification stream closed because its queue is full");
      closeEntry(entry);
    }
  };

  const publish = (userId: string, notice: InboxNotice): void => {
    if (closed) {
      return;
    }
    for (const entry of [...(entriesByUser.get(userId) ?? [])]) {
      publishToEntry(entry, notice);
    }
  };

  const close = (): void => {
    closed = true;
    const allEntries = [...entriesByUser.values()].flatMap((entries) => [...entries]);
    for (const entry of allEntries) {
      closeEntry(entry);
    }
    entriesByUser.clear();
  };

  return { subscribe, publish, close };
};
