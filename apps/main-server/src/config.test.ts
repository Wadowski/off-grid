// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { loadConfig } from "./load-config.js";

const requiredEnv: NodeJS.ProcessEnv = {
  OFFGRID_DATABASE_HOST: "db.internal",
  OFFGRID_DATABASE_NAME: "offgrid",
  OFFGRID_DATABASE_PASSWORD_FILE: "/run/secrets/db_password",
};

const secretFiles = (contents: string) => () => `${contents}\n`;

describe("loadConfig", () => {
  it("applies non-secret defaults and reads the database password from its secret file", () => {
    const config = loadConfig(requiredEnv, secretFiles("s3cret"));

    expect(config).toEqual({
      http: { host: "127.0.0.1", port: 3000 },
      database: {
        host: "db.internal",
        port: 5432,
        name: "offgrid",
        user: "outbox_app",
        password: "s3cret",
        poolMax: 10,
      },
      trustedProxies: [],
      rateLimitPerMinute: 300,
      logLevel: "info",
    });
  });

  it("names the missing secret variable", () => {
    const withoutSecret: NodeJS.ProcessEnv = {
      ...requiredEnv,
      OFFGRID_DATABASE_PASSWORD_FILE: undefined,
    };

    expect(() => loadConfig(withoutSecret, secretFiles("x"))).toThrow(
      /OFFGRID_DATABASE_PASSWORD_FILE/,
    );
  });

  it("rejects an empty secret file without echoing any content", () => {
    expect(() => loadConfig(requiredEnv, () => "  \n")).toThrow(
      "secret file named by OFFGRID_DATABASE_PASSWORD_FILE is empty",
    );
  });

  it("reports an unreadable secret file by variable name only", () => {
    const failingRead = () => {
      throw new Error("ENOENT: /run/secrets/db_password");
    };

    expect(() => loadConfig(requiredEnv, failingRead)).toThrow(
      "secret file named by OFFGRID_DATABASE_PASSWORD_FILE cannot be read",
    );
  });

  it.each([
    ["OFFGRID_HTTP_PORT", "70000"],
    ["OFFGRID_DATABASE_PORT", "0"],
    ["OFFGRID_DATABASE_POOL_MAX", "0"],
    ["OFFGRID_DATABASE_POOL_MAX", "101"],
    ["OFFGRID_DATABASE_USER", "Outbox-App"],
    ["OFFGRID_RATE_LIMIT_PER_MINUTE", "0"],
    ["OFFGRID_LOG_LEVEL", "trace"],
  ])("rejects an invalid %s value and names the variable", (variable, value) => {
    expect(() => loadConfig({ ...requiredEnv, [variable]: value }, secretFiles("x"))).toThrow(
      new RegExp(variable),
    );
  });
});
