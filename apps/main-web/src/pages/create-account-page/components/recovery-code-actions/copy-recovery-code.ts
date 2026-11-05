// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const copyRecoveryCode = (recoveryCode: string): Promise<void> =>
  navigator.clipboard.writeText(recoveryCode);
