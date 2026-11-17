// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { DEFAULT_FILES_MAX_UPLOAD_BYTES } from "../constants.js";
import { loadConfig } from "./load-config.js";

const DATABASE_SECRET_PATH = "/run/secrets/db_password";
const MAIL_KEY_PATH = "/run/secrets/mail_encryption_key";
const MAIL_KEY = Buffer.alloc(32, 7);

const requiredEnv: NodeJS.ProcessEnv = {
  OFFGRID_DATABASE_HOST: "db.internal",
  OFFGRID_DATABASE_NAME: "offgrid",
  OFFGRID_DATABASE_PASSWORD_FILE: DATABASE_SECRET_PATH,
  OFFGRID_MAIL_ENCRYPTION_KEY_FILE: MAIL_KEY_PATH,
};

const secretFiles =
  (contents: string, mailKey = MAIL_KEY.toString("base64")) =>
  (path: string): string =>
    path === MAIL_KEY_PATH ? `${mailKey}\n` : `${contents}\n`;

describe("loadConfig", () => {
  it("applies non-secret defaults and reads the database password from its secret file", () => {
    const config = loadConfig(requiredEnv, secretFiles("s3cret"));

    expect(config).toEqual({
      http: { host: "127.0.0.1", port: 3000 },
      database: {
        host: "db.internal",
        port: 5432,
        name: "offgrid",
        user: "offgrid_app",
        password: "s3cret",
        poolMax: 10,
      },
      mail: { encryptionKey: MAIL_KEY },
      trustedProxies: [],
      corsOrigins: [],
      rateLimitPerMinute: 300,
      outbox: { retentionDays: 7 },
      files: { directory: "/data/files", maxUploadBytes: DEFAULT_FILES_MAX_UPLOAD_BYTES },
      version: { version: "dev" },
      logLevel: "info",
    });
  });

  it.each([
    ["unset", undefined],
    ["empty", ""],
  ])("reports the version as dev when OFFGRID_VERSION is %s", (_label, value) => {
    const config = loadConfig({ ...requiredEnv, OFFGRID_VERSION: value }, secretFiles("x"));

    expect(config.version).toStrictEqual({ version: "dev" });
  });

  it("keeps a release version as given", () => {
    const config = loadConfig({ ...requiredEnv, OFFGRID_VERSION: "1.2.3" }, secretFiles("x"));

    expect(config.version).toEqual({ version: "1.2.3" });
  });

  it("reads the commit when OFFGRID_COMMIT is set", () => {
    const config = loadConfig(
      { ...requiredEnv, OFFGRID_VERSION: "1.2.3", OFFGRID_COMMIT: "abc1234" },
      secretFiles("x"),
    );

    expect(config.version).toEqual({ version: "1.2.3", commit: "abc1234" });
  });

  it("reads the outbox retention period in days", () => {
    const config = loadConfig(
      { ...requiredEnv, OFFGRID_OUTBOX_RETENTION_DAYS: "30" },
      secretFiles("x"),
    );

    expect(config.outbox).toEqual({ retentionDays: 30 });
  });

  it("reads the files directory and the maximum upload size", () => {
    const config = loadConfig(
      {
        ...requiredEnv,
        OFFGRID_FILES_DIRECTORY: "/srv/offgrid/files",
        OFFGRID_FILES_MAX_UPLOAD_BYTES: "1048576",
      },
      secretFiles("x"),
    );

    expect(config.files).toEqual({ directory: "/srv/offgrid/files", maxUploadBytes: 1048576 });
  });

  it("splits the allowed CORS origins and trims each entry", () => {
    const config = loadConfig(
      {
        ...requiredEnv,
        OFFGRID_CORS_ORIGINS: " http://localhost:8080 , http://192.168.1.20:8080 ",
      },
      secretFiles("x"),
    );

    expect(config.corsOrigins).toEqual(["http://localhost:8080", "http://192.168.1.20:8080"]);
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

  it("names the missing mail encryption key variable", () => {
    const withoutMailKey: NodeJS.ProcessEnv = {
      ...requiredEnv,
      OFFGRID_MAIL_ENCRYPTION_KEY_FILE: undefined,
    };

    expect(() => loadConfig(withoutMailKey, secretFiles("x"))).toThrow(
      /OFFGRID_MAIL_ENCRYPTION_KEY_FILE/,
    );
  });

  it("rejects a mail encryption key that is not 32 bytes and does not echo it", () => {
    const shortKey = Buffer.alloc(16, 1).toString("base64");

    expect(() => loadConfig(requiredEnv, secretFiles("x", shortKey))).toThrow(
      "secret file named by OFFGRID_MAIL_ENCRYPTION_KEY_FILE must hold a base64-encoded 32-byte key",
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
    ["OFFGRID_OUTBOX_RETENTION_DAYS", "0"],
    ["OFFGRID_OUTBOX_RETENTION_DAYS", "3651"],
    ["OFFGRID_LOG_LEVEL", "trace"],
    ["OFFGRID_VERSION", "1.2.3 <script>"],
    ["OFFGRID_VERSION", "x".repeat(65)],
    ["OFFGRID_COMMIT", "not-a-commit"],
    ["OFFGRID_COMMIT", "ABC1234"],
    ["OFFGRID_CORS_ORIGINS", "not a url"],
    ["OFFGRID_CORS_ORIGINS", "*"],
    ["OFFGRID_CORS_ORIGINS", "http://localhost:8080/app"],
    ["OFFGRID_CORS_ORIGINS", "http://localhost:8080/"],
    ["OFFGRID_CORS_ORIGINS", "javascript:alert(1)"],
    ["OFFGRID_FILES_DIRECTORY", "data/files"],
    ["OFFGRID_FILES_DIRECTORY", ""],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", "0"],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", "-1"],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", "1.5"],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", "abc"],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", ""],
    ["OFFGRID_FILES_MAX_UPLOAD_BYTES", String(Number.MAX_SAFE_INTEGER + 1)],
  ])("rejects an invalid %s value and names the variable", (variable, value) => {
    expect(() => loadConfig({ ...requiredEnv, [variable]: value }, secretFiles("x"))).toThrow(
      new RegExp(variable),
    );
  });
});
