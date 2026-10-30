// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const assertModuleName = (runAs: string): void => {
  if (!/^[a-z][a-z0-9]*$/.test(runAs)) {
    throw new Error(`invalid module name for a subscriber: ${JSON.stringify(runAs)}`);
  }
};
