// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { readLastEventId } from "./read-last-event-id.js";

const NOTICE_ID = "9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f";

describe("readLastEventId", () => {
  it("reports an absent header when the client sent none", () => {
    expect(readLastEventId(undefined)).toEqual({ kind: "absent" });
  });

  it("returns the id when the header is a UUID", () => {
    expect(readLastEventId(NOTICE_ID)).toEqual({ kind: "valid", id: NOTICE_ID });
  });

  it("reports an invalid header when it is not a UUID", () => {
    expect(readLastEventId("not-a-uuid")).toEqual({ kind: "invalid" });
  });

  it("reports an empty header as invalid", () => {
    expect(readLastEventId("")).toEqual({ kind: "invalid" });
  });

  it("reports a repeated header as invalid", () => {
    expect(readLastEventId([NOTICE_ID, NOTICE_ID])).toEqual({ kind: "invalid" });
  });
});
