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
  "password123456", // gitleaks:allow
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

export const USER_ACCOUNT_MODEL = "UserAccount";

export const FIRST_ADMIN_CLAIM_MODEL = "FirstAdminClaim";

export const UNIQUE_VIOLATION_CODE = "P2002";

export const ACCESS_TOKEN_BYTES = 32;

export const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

export const REMEMBER_ME_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const REFRESH_REUSE_GRACE_MS = 30 * 1000;

export const SIGN_IN_FAILURE_LIMIT = 5;

export const SIGN_IN_LOCKOUT_MS = 15 * 60 * 1000;

export const SIGN_IN_RATE_LIMIT_PER_MINUTE = 10;

export const REFRESH_RATE_LIMIT_PER_MINUTE = 30;

export const SIGN_OUT_RATE_LIMIT_PER_MINUTE = 30;

export const RATE_WINDOW_MS = 60_000;

export const CLIENT_REQUEST_HEADER = "x-offgrid-request";

export const CLIENT_REQUEST_HEADER_VALUE = "1";

export const DUMMY_PASSWORD = "offgrid-timing-placeholder-not-a-password";

export const RESET_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const RESET_CODE_LENGTH = 12;

export const RESET_CODE_GROUP_SIZE = 4;

export const RESET_CODE_LIFETIME_MS = 24 * 60 * 60 * 1000;

export const PASSWORD_RESET_RATE_LIMIT_PER_MINUTE = 10;
