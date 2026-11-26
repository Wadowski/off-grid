// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderFormCopy } from "./types.js";

export const NEW_FOLDER_FORM_COPY: FolderFormCopy = {
  testIdPrefix: "new-folder",
  nameLabelTextId: "files.newFolder.name",
  requiredTextId: "files.newFolder.required",
  placeholderTextId: "files.newFolder.placeholder",
  cancelTextId: "files.newFolder.cancel",
  submitTextId: "files.newFolder.create",
  submittingTextId: "files.newFolder.creating",
  nameErrorTextIds: {
    nameRequired: "files.newFolder.errors.nameRequired",
    nameTooLong: "files.newFolder.errors.nameTooLong",
    nameInvalid: "files.newFolder.errors.nameInvalid",
  },
};

export const RENAME_ENTRY_FORM_COPY: FolderFormCopy = {
  testIdPrefix: "rename-entry",
  nameLabelTextId: "files.rename.name",
  requiredTextId: "files.rename.required",
  placeholderTextId: null,
  cancelTextId: "files.rename.cancel",
  submitTextId: "files.rename.submit",
  submittingTextId: "files.rename.submitting",
  nameErrorTextIds: {
    nameRequired: "files.rename.errors.nameRequired",
    nameTooLong: "files.rename.errors.nameTooLong",
    nameInvalid: "files.rename.errors.nameInvalid",
  },
};
