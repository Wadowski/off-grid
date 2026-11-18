// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toolEnvironment = (password?: string): NodeJS.ProcessEnv => ({
  PATH: process.env.PATH ?? "",
  ...(password === undefined ? {} : { PGPASSWORD: password }),
});
