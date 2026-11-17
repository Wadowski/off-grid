// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const compareReleaseVersions = (left: string, right: string): number => {
  const [leftMajor = 0, leftMinor = 0, leftPatch = 0] = left.split(".").map(Number);
  const [rightMajor = 0, rightMinor = 0, rightPatch = 0] = right.split(".").map(Number);
  return leftMajor - rightMajor || leftMinor - rightMinor || leftPatch - rightPatch;
};
