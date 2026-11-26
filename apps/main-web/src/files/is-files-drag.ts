// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isFilesDrag = (dataTransfer: DataTransfer | null): boolean =>
  dataTransfer !== null && Array.from(dataTransfer.types).includes("Files");
