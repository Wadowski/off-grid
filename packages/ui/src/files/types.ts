// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type FileDateLabel =
  | { readonly kind: "today"; readonly time: string }
  | { readonly kind: "yesterday" }
  | { readonly kind: "date"; readonly text: string };

export type CalendarDay = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export type FileKind =
  | "folder"
  | "image"
  | "document"
  | "spreadsheet"
  | "pdf"
  | "archive"
  | "audio"
  | "video"
  | "generic";

export type ActivateKeyEvent = {
  readonly key: string;
  readonly preventDefault: () => void;
};

export type FileEntryProps = {
  readonly name: string;
  readonly kind: FileKind;
  readonly modifiedAt?: Date;
  readonly sizeBytes?: number;
  readonly itemCount?: number;
  readonly selected?: boolean;
  readonly trailing?: ReactNode;
  readonly onActivate?: () => void;
  readonly locale?: string;
  readonly now?: Date;
  readonly timeZone?: string;
};
