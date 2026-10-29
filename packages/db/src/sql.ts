// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

export function quoteIdent(name: string): string {
  if (!IDENTIFIER.test(name)) {
    throw new Error(`invalid SQL identifier: ${JSON.stringify(name)}`);
  }
  return `"${name}"`;
}
