// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const describeError = (error: unknown): { name: string; code?: string } => {
  if (!(error instanceof Error)) {
    return { name: "NonError" };
  }
  const code: unknown = Reflect.get(error, "code");
  return typeof code === "string" ? { name: error.name, code } : { name: error.name };
};
