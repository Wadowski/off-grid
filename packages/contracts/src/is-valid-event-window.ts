// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isValidEventWindow = (window: {
  readonly startsAt: Date;
  readonly endsAt: Date;
}): boolean => window.endsAt.getTime() >= window.startsAt.getTime();
