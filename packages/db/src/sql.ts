// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

/**
 * Quotes a schema, role or table name for SQL. Accepts only lowercase
 * identifiers, so it can never be used to inject SQL.
 */
export function quoteIdent(name: string): string {
  if (!IDENTIFIER.test(name)) {
    throw new Error(`invalid SQL identifier: ${JSON.stringify(name)}`);
  }
  return `"${name}"`;
}
