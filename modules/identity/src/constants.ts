// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const INSTANCE_SETTINGS_KEY = "instance";

export const INSTANCE_ROLES = ["admin", "user"] as const;

export const ACCOUNT_STATUSES = ["active", "disabled"] as const;

export const EMAIL_MAX_LENGTH = 254;

export const PASSWORD_HASH_PATTERN = /^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$/;

export const FIRST_ADMIN_CLAIM_KEY = "instance";
