// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type Drive = {
  id: string;
  familyId: string | null;
  name: string;
  createdAt: string;
};

export type FilesWorld = {
  drives: Record<string, Drive[]>;
  personalDriveIds: Record<string, string>;
  familyDriveIds: Record<string, string>;
};

export type FileItem = { id: string; name: string; isFolder: boolean; parentId: string | null };

export type Container = { kind: "drive" | "folder"; id: string };
