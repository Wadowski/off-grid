// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { ListedNotification } from "../../types.js";
import { formatNoticeFrame } from "./format-notice-frame.js";

const notice: ListedNotification = {
  id: "9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f",
  type: "event-invited",
  category: "calendar",
  data: { eventId: "1f2e3d4c-5b6a-4978-8a9b-0c1d2e3f4a5b" },
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
};

describe("formatNoticeFrame", () => {
  it("writes the event, id and data lines, ended by a blank line", () => {
    expect(formatNoticeFrame(notice)).toBe(
      `event: notification\nid: ${notice.id}\ndata: ${JSON.stringify(notice)}\n\n`,
    );
  });

  it("keeps the data on one line", () => {
    const lines = formatNoticeFrame(notice).split("\n");

    expect(lines.filter((line) => line.startsWith("data: "))).toHaveLength(1);
    expect(lines.at(-1)).toBe("");
    expect(lines.at(-2)).toBe("");
  });
});
