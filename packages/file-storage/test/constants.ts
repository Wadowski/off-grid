// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const PAYLOAD = Buffer.from("0123456789abcdefghijklmnopqrstuvwxyz", "utf8");

export const INVALID_KEYS = [
  "",
  "../etc/passwd",
  "/etc/passwd",
  "a/b",
  "..",
  "0123456789abcdef0123456789abcdef\0",
  "0123456789ABCDEF0123456789ABCDEF",
  "0123456789abcdef0123456789abcde",
  "0123456789abcdef0123456789abcdef0",
];
