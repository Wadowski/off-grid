// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/;

export const MAIL_PROVIDERS = ["gmail", "icloud", "fastmail", "outlook", "other"] as const;

export const MAIL_SECURITY = ["tls", "starttls", "none"] as const;

export const MAIL_PRESETS = {
  gmail: { host: "smtp.gmail.com", port: 587, security: "starttls" },
  icloud: { host: "smtp.mail.me.com", port: 587, security: "starttls" },
  fastmail: { host: "smtp.fastmail.com", port: 465, security: "tls" },
  outlook: { host: "smtp.office365.com", port: 587, security: "starttls" },
} as const;

export const MAIL_PROVIDER_BY_DOMAIN: ReadonlyMap<string, (typeof MAIL_PROVIDERS)[number]> =
  new Map([
    ["gmail.com", "gmail"],
    ["googlemail.com", "gmail"],
    ["icloud.com", "icloud"],
    ["me.com", "icloud"],
    ["mac.com", "icloud"],
    ["fastmail.com", "fastmail"],
    ["fastmail.fm", "fastmail"],
    ["outlook.com", "outlook"],
    ["hotmail.com", "outlook"],
    ["live.com", "outlook"],
    ["msn.com", "outlook"],
  ]);
