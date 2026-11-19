// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { ConfigError } from "./config-error.js";
import { readUpdaterSettings } from "./read-updater-settings.js";

const TOKEN_PATH = "/run/secrets/updater_token";
const UPDATER_URL = "http://updater:3100";
const TOKEN = "updater-secret-value";

const readToken = (path: string): string => {
  if (path === TOKEN_PATH) {
    return `${TOKEN}\n`;
  }
  throw new Error("missing");
};

describe("readUpdaterSettings", () => {
  it("returns null when neither the URL nor the token file is set", () => {
    expect(readUpdaterSettings(undefined, undefined, readToken)).toBeNull();
  });

  it("returns the URL and the trimmed token read from its file", () => {
    expect(readUpdaterSettings(UPDATER_URL, TOKEN_PATH, readToken)).toEqual({
      url: UPDATER_URL,
      token: TOKEN,
    });
  });

  it("refuses a URL without a token file, naming the missing variable", () => {
    expect(() => readUpdaterSettings(UPDATER_URL, undefined, readToken)).toThrow(
      new ConfigError("OFFGRID_UPDATER_TOKEN_FILE is required when OFFGRID_UPDATER_URL is set"),
    );
  });

  it("refuses a token file without a URL, naming the missing variable", () => {
    expect(() => readUpdaterSettings(undefined, TOKEN_PATH, readToken)).toThrow(
      new ConfigError("OFFGRID_UPDATER_URL is required when OFFGRID_UPDATER_TOKEN_FILE is set"),
    );
  });

  it("refuses an empty token file without echoing its content", () => {
    expect(() => readUpdaterSettings(UPDATER_URL, TOKEN_PATH, () => "  \n")).toThrow(
      new ConfigError("secret file named by OFFGRID_UPDATER_TOKEN_FILE is empty"),
    );
  });

  it("refuses an unreadable token file by variable name only", () => {
    expect(() => readUpdaterSettings(UPDATER_URL, "/nope", readToken)).toThrow(
      new ConfigError("secret file named by OFFGRID_UPDATER_TOKEN_FILE cannot be read"),
    );
  });
});
