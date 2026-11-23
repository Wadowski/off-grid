// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toBaseMediaType = (mediaType: string): string =>
  (mediaType.split(";")[0] ?? "").trim().toLowerCase();
