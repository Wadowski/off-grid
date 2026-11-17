// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const baseMimeType = (mimeType: string): string =>
  mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
