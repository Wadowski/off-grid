// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isOverUploadLimit = (sizeBytes: number, maxUploadBytes: number | null): boolean =>
  maxUploadBytes !== null && sizeBytes > maxUploadBytes;
