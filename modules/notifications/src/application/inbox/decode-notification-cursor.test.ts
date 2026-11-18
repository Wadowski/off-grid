// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { InvalidNotificationCursorError } from "../errors/invalid-notification-cursor-error.js";
import { decodeNotificationCursor } from "./decode-notification-cursor.js";
import { encodeNotificationCursor } from "./encode-notification-cursor.js";

const encodePayload = (payload: unknown): string =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

describe("decodeNotificationCursor", () => {
  it("returns the cursor that encodeNotificationCursor wrote", () => {
    const cursor = {
      createdAt: new Date("2026-11-01T10:00:00.123Z"),
      notificationId: randomUUID(),
    };

    expect(decodeNotificationCursor(encodeNotificationCursor(cursor))).toEqual(cursor);
  });

  it.each([
    ["text that is not base64url JSON", "!!!not-a-cursor!!!"],
    ["JSON that is not an object", encodePayload("text")],
    ["a payload with no id", encodePayload({ c: "2026-11-01T10:00:00.000Z" })],
    ["a payload with a bad id", encodePayload({ c: "2026-11-01T10:00:00.000Z", i: "nope" })],
    ["a payload with a bad date", encodePayload({ c: "yesterday", i: randomUUID() })],
    ["an empty value", ""],
  ])("rejects %s", (_label, value) => {
    expect(() => decodeNotificationCursor(value)).toThrow(InvalidNotificationCursorError);
  });
});
