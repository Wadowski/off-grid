// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const kebabCase = (name: string): string => {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};
