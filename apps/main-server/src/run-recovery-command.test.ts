// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { describe, expect, it } from "vitest";
import { runRecoveryCommand } from "./run-recovery-command.js";

const NO_DATABASE_NEEDED = null as unknown as ModuleDatabase;

describe("runRecoveryCommand", () => {
  it("shows the usage for an unknown command without touching the database", async () => {
    await expect(runRecoveryCommand(undefined, {}, NO_DATABASE_NEEDED)).rejects.toThrow("Usage:");
    await expect(runRecoveryCommand("unknown", {}, NO_DATABASE_NEEDED)).rejects.toThrow("Usage:");
  });

  it("requires --email for reset-password", async () => {
    await expect(runRecoveryCommand("reset-password", {}, NO_DATABASE_NEEDED)).rejects.toThrow(
      "--email is required",
    );
  });

  it("requires --email and --name for create-admin", async () => {
    await expect(
      runRecoveryCommand("create-admin", { email: "owner@example.com" }, NO_DATABASE_NEEDED),
    ).rejects.toThrow("--name is required");
    await expect(
      runRecoveryCommand("create-admin", { name: "Owner" }, NO_DATABASE_NEEDED),
    ).rejects.toThrow("--email is required");
  });
});
