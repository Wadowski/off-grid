// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// The Postgres tools get only PATH and, when a password is given, PGPASSWORD.
// Connection details travel as arguments, so no other variable of the updater
// (secrets paths, tokens, proxy settings) reaches the child process.
export const toolEnvironment = (password?: string): NodeJS.ProcessEnv => ({
  PATH: process.env.PATH ?? "",
  ...(password === undefined ? {} : { PGPASSWORD: password }),
});
