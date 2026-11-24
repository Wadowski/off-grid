// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toUploadPercent = (loaded: number, total: number): number =>
  total > 0 ? Math.floor((loaded * 100) / total) : 0;
