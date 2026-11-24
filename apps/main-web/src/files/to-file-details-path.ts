// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const toFileDetailsPath = (driveId: string, fileId: string): string =>
  `/files/${encodeURIComponent(driveId)}/file/${encodeURIComponent(fileId)}`;
