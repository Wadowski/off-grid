// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it, vi } from "vitest";
import { toolEnvironment } from "./tool-environment.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("toolEnvironment", () => {
  it("passes PATH and PGPASSWORD and nothing else from the updater environment", () => {
    vi.stubEnv("PATH", "/usr/bin");
    vi.stubEnv("OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE", "/run/secrets/migrator-password");
    vi.stubEnv("UNRELATED_TOKEN", "token-value");

    expect(toolEnvironment("migrator-secret-value")).toEqual({
      PATH: "/usr/bin",
      PGPASSWORD: "migrator-secret-value",
    });
  });

  it("omits PGPASSWORD when no password is given", () => {
    vi.stubEnv("PATH", "/usr/bin");
    vi.stubEnv("UNRELATED_TOKEN", "token-value");

    expect(toolEnvironment()).toEqual({ PATH: "/usr/bin" });
  });
});
