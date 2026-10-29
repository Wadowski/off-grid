// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./config.js";

const requiredEnv = {
  OFFGRID_DATABASE_HOST: "db.internal",
  OFFGRID_DATABASE_NAME: "offgrid",
  OFFGRID_DATABASE_PASSWORD_FILE: "/run/secrets/db_password",
};

const secretFiles = (contents: string) => () => `${contents}\n`;

describe("loadConfig", () => {
  it("applies non-secret defaults and reads the database password from its secret file", () => {
    const config = loadConfig(requiredEnv, secretFiles("s3cret"));

    expect(config).toEqual({
      http: { host: "0.0.0.0", port: 3000 },
      database: {
        host: "db.internal",
        port: 5432,
        name: "offgrid",
        user: "outbox_app",
        password: "s3cret",
        poolMax: 10,
      },
      devIdentity: false,
      rateLimitPerMinute: 300,
      logLevel: "info",
    });
  });

  it("turns the dev identity flag on only for the exact value true", () => {
    expect(
      loadConfig({ ...requiredEnv, OFFGRID_DEV_IDENTITY: "true" }, secretFiles("x")).devIdentity,
    ).toBe(true);
    expect(() =>
      loadConfig({ ...requiredEnv, OFFGRID_DEV_IDENTITY: "yes" }, secretFiles("x")),
    ).toThrow(ConfigError);
  });

  it("names the missing secret variable and never reads a secret it cannot find", () => {
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

  it("rejects an out-of-range port with the variable name in the message", () => {
    expect(() =>
      loadConfig({ ...requiredEnv, OFFGRID_HTTP_PORT: "70000" }, secretFiles("x")),
    ).toThrow(/OFFGRID_HTTP_PORT/);
  });
});
