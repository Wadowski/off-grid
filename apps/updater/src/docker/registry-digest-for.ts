// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const registryDigestFor = (
  repoDigests: readonly string[],
  referencePattern: RegExp,
): string | null => repoDigests.find((digest) => referencePattern.test(digest)) ?? null;
