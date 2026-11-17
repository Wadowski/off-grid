// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const EVENT_NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-v([1-9][0-9]*)$/;

export const SECOND_MS = 1000;

export const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export const END_BEFORE_START_REASON = "endsBeforeStart";

export const MAIL_PROVIDERS = ["gmail", "icloud", "fastmail", "other"] as const;

export const MAIL_SECURITY = ["tls", "starttls", "none"] as const;

export const MAIL_PRESETS = {
  gmail: { host: "smtp.gmail.com", port: 587, security: "starttls" },
  icloud: { host: "smtp.mail.me.com", port: 587, security: "starttls" },
  fastmail: { host: "smtp.fastmail.com", port: 465, security: "tls" },
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
  ]);

export const RELEASE_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const GIT_COMMIT_PATTERN = /^[0-9a-f]{40}$/;

export const SERVER_IMAGE_REFERENCE_PATTERN =
  /^ghcr\.io\/[a-z0-9][a-z0-9-]*\/offgrid-main-server@sha256:[0-9a-f]{64}$/;

export const WEB_IMAGE_REFERENCE_PATTERN =
  /^ghcr\.io\/[a-z0-9][a-z0-9-]*\/offgrid-main-web@sha256:[0-9a-f]{64}$/;

export const RELEASE_PLATFORMS = ["linux/amd64", "linux/arm64"] as const;
