// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type FileTableColumnTextId =
  "files.table.name" | "files.table.modified" | "files.table.size" | "files.table.type";

export type FileTableColumn = {
  readonly key: "name" | "modified" | "size" | "type";
  readonly textId: FileTableColumnTextId;
  readonly align: "start" | "end";
  readonly width: string;
};

export type FileTableProps = {
  readonly isBusy: boolean;
  readonly children: ReactNode;
};
