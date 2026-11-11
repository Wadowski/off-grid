// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { ClientBase } from "pg";
import { setPgFamilyContext } from "./set-pg-family-context.js";

describe("setPgFamilyContext", () => {
  const familyId = "5b2f6a8e-1c3d-4e5f-8a9b-0c1d2e3f4a5b";

  it("sets the transaction-local app.family_id to the parsed family", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await setPgFamilyContext({ query } as unknown as ClientBase, familyId);

    expect(query).toHaveBeenCalledWith("SELECT set_config('app.family_id', $1, true)", [familyId]);
  });

  it("refuses a value that is not a uuid and sets nothing", async () => {
    const query = vi.fn();

    await expect(
      setPgFamilyContext({ query } as unknown as ClientBase, "not-a-uuid"),
    ).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
