// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { splitFileName } from "./split-file-name.js";
import { fitStem } from "./fit-stem.js";

const numberSuffix = (number: number): string => ` (${number})`;

const candidateName = (stem: string, extension: string, number: number): string => {
  const suffix = numberSuffix(number);
  return `${fitStem(stem, suffix, extension)}${suffix}${extension}`;
};

export const restoredName = (
  name: string,
  isFolder: boolean,
  takenNames: readonly string[],
): string => {
  const taken = new Set(takenNames.map((takenName) => takenName.toLowerCase()));
  if (!taken.has(name.toLowerCase())) {
    return name;
  }
  const { stem, extension } = splitFileName(name, isFolder);
  let number = 2;
  while (taken.has(candidateName(stem, extension, number).toLowerCase())) {
    number += 1;
  }
  return candidateName(stem, extension, number);
};
