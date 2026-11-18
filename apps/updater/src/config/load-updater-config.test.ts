// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { loadUpdaterConfig } from "./load-updater-config.js";

const PASSWORD_PATH = "/run/secrets/migrator-password";

const requiredEnv: NodeJS.ProcessEnv = {
  OFFGRID_UPDATER_DATABASE_HOST: "db.internal",
  OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE: PASSWORD_PATH,
};

const secretFiles = (contents: string) => (path: string) => {
  if (path !== PASSWORD_PATH) {
    throw new Error(`unexpected path ${path}`);
  }
  return `${contents}\n`;
};

describe("loadUpdaterConfig", () => {
  it("applies defaults and reads the migrator password from its file", () => {
    const config = loadUpdaterConfig(requiredEnv, secretFiles("m1gr4tor"));

    expect(config).toEqual({
      database: {
        host: "db.internal",
        port: 5432,
        database: "offgrid",
        user: "offgrid_migrator",
        password: "m1gr4tor",
      },
      secretsDirectory: "data/secrets",
      backupRoot: "data/backups",
      backupRetention: 3,
      healthUrl: "http://127.0.0.1:3000/api/health",
      webHealthUrl: "http://127.0.0.1:8080/",
      healthTimeoutMilliseconds: 120000,
      statusFile: "data/updater/status.json",
    });
  });

  it("reads retention, backup root, secrets directory, health url and timeout", () => {
    const config = loadUpdaterConfig(
      {
        ...requiredEnv,
        OFFGRID_UPDATER_BACKUP_RETENTION: "5",
        OFFGRID_UPDATER_BACKUP_ROOT: "/backups",
        OFFGRID_UPDATER_SECRETS_DIRECTORY: "/run/secrets",
        OFFGRID_UPDATER_HEALTH_URL: "https://server.internal/health",
        OFFGRID_UPDATER_WEB_HEALTH_URL: "https://web.internal/",
        OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS: "30",
        OFFGRID_UPDATER_STATUS_FILE: "/backups/status.json",
      },
      secretFiles("x"),
    );

    expect(config).toMatchObject({
      backupRoot: "/backups",
      secretsDirectory: "/run/secrets",
      backupRetention: 5,
      healthUrl: "https://server.internal/health",
      webHealthUrl: "https://web.internal/",
      healthTimeoutMilliseconds: 30000,
      statusFile: "/backups/status.json",
    });
  });

  it("names the missing password file variable", () => {
    const withoutPassword: NodeJS.ProcessEnv = {
      ...requiredEnv,
      OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE: undefined,
    };

    expect(() => loadUpdaterConfig(withoutPassword, secretFiles("x"))).toThrow(
      /OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE/,
    );
  });

  it("rejects an empty password file without echoing its content", () => {
    expect(() => loadUpdaterConfig(requiredEnv, () => "  \n")).toThrow(
      "secret file named by OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE is empty",
    );
  });

  it("reports an unreadable password file by variable name only", () => {
    const failingRead = () => {
      throw new Error("ENOENT: /run/secrets/migrator-password");
    };

    expect(() => loadUpdaterConfig(requiredEnv, failingRead)).toThrow(
      "secret file named by OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE cannot be read",
    );
  });

  it.each([
    ["OFFGRID_UPDATER_BACKUP_RETENTION", "0"],
    ["OFFGRID_UPDATER_BACKUP_RETENTION", "1.5"],
    ["OFFGRID_UPDATER_BACKUP_RETENTION", "abc"],
    ["OFFGRID_UPDATER_HEALTH_URL", "ftp://server.internal/health"],
    ["OFFGRID_UPDATER_HEALTH_URL", "not a url"],
    ["OFFGRID_UPDATER_WEB_HEALTH_URL", "ftp://web.internal/"],
    ["OFFGRID_UPDATER_STATUS_FILE", ""],
    ["OFFGRID_UPDATER_HEALTH_TIMEOUT_SECONDS", "0"],
    ["OFFGRID_UPDATER_DATABASE_PORT", "70000"],
    ["OFFGRID_UPDATER_DATABASE_USER", "Migrator-Role"],
  ])("rejects an invalid %s value and names the variable", (variable, value) => {
    expect(() =>
      loadUpdaterConfig({ ...requiredEnv, [variable]: value }, secretFiles("x")),
    ).toThrow(new RegExp(variable));
  });
});
