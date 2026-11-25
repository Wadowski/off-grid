// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  FilesSortDirection,
  FilesSortField,
  FilesView,
  FilesViewPreference,
} from "../../../../files/types.js";

export type ViewControlsProps = {
  readonly view: FilesView;
  readonly sort: FilesSortField;
  readonly direction: FilesSortDirection;
  readonly onChange: (change: Partial<FilesViewPreference>) => void;
};
