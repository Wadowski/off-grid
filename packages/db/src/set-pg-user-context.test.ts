// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { ClientBase } from "pg";
import { setPgUserContext } from "./set-pg-user-context.js";

describe("setPgUserContext", () => {
  const userId = "5b2f6a8e-1c3d-4e5f-8a9b-0c1d2e3f4a5b";

  it("sets the transaction-local app.user_id to the parsed user", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });

    await setPgUserContext({ query } as unknown as ClientBase, userId);

    expect(query).toHaveBeenCalledWith("SELECT set_config('app.user_id', $1, true)", [userId]);
  });

  it("refuses a value that is not a uuid and sets nothing", async () => {
    const query = vi.fn();

    await expect(
      setPgUserContext({ query } as unknown as ClientBase, "not-a-uuid"),
    ).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
