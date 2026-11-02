// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const INSTANCE_SETTINGS_KEY = "instance";

export const INSTANCE_ROLES = ["admin", "user"] as const;

export const ACCOUNT_STATUSES = ["active", "disabled"] as const;

export const EMAIL_MAX_LENGTH = 254;

export const PASSWORD_HASH_PATTERN = /^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$/;

export const FIRST_ADMIN_CLAIM_KEY = "instance";

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_MAX_LENGTH = 128;

export const VERY_COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password1234",
  "password12345",
  "password123456", // gitleaks:allow dictionary word in the common-password list, not a credential
  "qwertyuiop12",
  "qwerty123456",
  "iloveyou1234",
  "letmein12345",
  "welcome12345",
  "monkey123456",
  "admin1234567",
  "administrator",
  "changeme1234",
  "123456789012",
  "1234567890123",
  "abcdefghijkl",
  "passw0rd1234",
  "trustno12345",
  "dragon123456",
  "sunshine1234",
  "football1234",
]);

export const PERSONAL_FRAGMENT_MIN_LENGTH = 3;

export const ARGON2_MEMORY_COST_KIB = 19456;

export const ARGON2_TIME_COST = 2;

export const ARGON2_PARALLELISM = 1;

export const RECOVERY_CODE_BYTES = 16;

export const REFRESH_TOKEN_BYTES = 32;

export const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000;

export const REFRESH_COOKIE_NAME = "offgrid_refresh";

export const REFRESH_COOKIE_PATH = "/api/auth";

export const SIGN_UP_RATE_LIMIT_PER_MINUTE = 5;

export const SIGN_UP_RATE_WINDOW_MS = 60_000;
