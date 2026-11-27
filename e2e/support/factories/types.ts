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
  folderIds?: Record<string, string>;
  fileIds?: Record<string, string>;
};

export type FileItem = { id: string; name: string; isFolder: boolean; parentId: string | null };

export type FileVersionEntry = { id: string; number: number };

export type Container = { kind: "drive" | "folder"; id: string };

export type DownloadResponse = { status: number; headers: Record<string, string>; body: string };

export type NoticeType =
  "password-changed" | "recovery-code-regenerated" | "event-invited" | "event-reminder";

export type ListedCalendar = {
  id: string;
  name: string;
  familyId: string | null;
  isDefault: boolean;
};
