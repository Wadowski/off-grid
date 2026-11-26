// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CreateFolderStatus, FilesErrorTextId } from "../../files/types.js";

export type FolderNameError = "nameRequired" | "nameTooLong" | "nameInvalid";

export type FolderNameErrorTextId =
  | "files.newFolder.errors.nameRequired"
  | "files.newFolder.errors.nameTooLong"
  | "files.newFolder.errors.nameInvalid"
  | "files.rename.errors.nameRequired"
  | "files.rename.errors.nameTooLong"
  | "files.rename.errors.nameInvalid";

export type FolderFormCopy = {
  readonly testIdPrefix: string;
  readonly nameLabelTextId: "files.newFolder.name" | "files.rename.name";
  readonly requiredTextId: "files.newFolder.required" | "files.rename.required";
  readonly placeholderTextId: "files.newFolder.placeholder" | null;
  readonly cancelTextId: "files.newFolder.cancel" | "files.rename.cancel";
  readonly submitTextId: "files.newFolder.create" | "files.rename.submit";
  readonly submittingTextId: "files.newFolder.creating" | "files.rename.submitting";
  readonly nameErrorTextIds: Record<FolderNameError, FolderNameErrorTextId>;
};

export type FolderFormProps = {
  readonly status: CreateFolderStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly onSubmit: (name: string) => Promise<void>;
  readonly onCancel: () => void;
  readonly copy?: FolderFormCopy;
  readonly initialName?: string;
  readonly initialSelectionEnd?: number;
};

export type FolderNameFieldProps = {
  readonly copy: FolderFormCopy;
  readonly value: string;
  readonly errorTextId: FolderNameErrorTextId | undefined;
  readonly selectionEnd: number | undefined;
  readonly onChange: (value: string) => void;
};
