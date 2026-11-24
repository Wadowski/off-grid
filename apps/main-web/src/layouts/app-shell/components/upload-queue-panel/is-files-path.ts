// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const FILES_PATH = "/files";

export const isFilesPath = (pathname: string): boolean =>
  pathname === FILES_PATH || pathname.startsWith(`${FILES_PATH}/`);
