// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const composeEnvironment = (
  containerEnv: readonly string[],
  imageEnv: readonly string[],
): string[] => {
  const imageEntries = new Set(imageEnv);
  return containerEnv.filter((entry) => !imageEntries.has(entry));
};
