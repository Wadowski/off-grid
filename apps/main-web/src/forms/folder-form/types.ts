// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFolderStatus, FilesErrorTextId } from "../../files/types.js";

export type FolderNameErrorTextId =
  | "files.newFolder.errors.nameRequired"
  | "files.newFolder.errors.nameTooLong"
  | "files.newFolder.errors.nameInvalid";

export type FolderFormProps = {
  readonly status: CreateFolderStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly onSubmit: (name: string) => Promise<void>;
  readonly onCancel: () => void;
};

export type FolderNameFieldProps = {
  readonly value: string;
  readonly errorTextId: FolderNameErrorTextId | undefined;
  readonly onChange: (value: string) => void;
};
