// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isDirectoryItem = (item: DataTransferItem): boolean =>
  item.webkitGetAsEntry?.()?.isDirectory === true;
