// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const INVITATION_CODE_BYTES = 16;

export const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const INVITATION_FAILURE_LIMIT = 5;

const INVITATION_LOCKOUT_MS = 15 * 60 * 1000;

export const INVITATION_ATTEMPT_POLICY = {
  limit: INVITATION_FAILURE_LIMIT,
  lockoutMs: INVITATION_LOCKOUT_MS,
};
