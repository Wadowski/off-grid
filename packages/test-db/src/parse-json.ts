// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const parseJson = (contents: string): unknown => {
  try {
    return JSON.parse(contents);
  } catch {
    throw new Error("Shared test database connection file is not valid JSON");
  }
};
