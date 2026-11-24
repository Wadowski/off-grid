// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "@offgrid/ui";
import type {
  Breadcrumb,
  FileDetailsState,
  FileEntry,
  FilesErrorTextId,
  RegularFileEntry,
} from "../../../../files/types.js";

export type FileDetailsPanelProps = {
  readonly fileId: FileEntry["id"];
  readonly onClose: () => void;
};

export type FileDetailsPanelLoadingView = {
  readonly kind: "loading";
};

export type FileDetailsPanelFailedView = {
  readonly kind: "failed";
  readonly errorTextId: FilesErrorTextId;
  readonly onRetry: FileDetailsState["refresh"];
};

export type FileDetailsPanelReadyView = {
  readonly kind: "ready";
  readonly file: RegularFileEntry;
  readonly breadcrumbs: readonly Breadcrumb[];
};

export type FileDetailsPanelView =
  FileDetailsPanelLoadingView | FileDetailsPanelFailedView | FileDetailsPanelReadyView;

export type FileDetailsPanelSummary = {
  readonly name: string;
  readonly kind: FileKind;
};
