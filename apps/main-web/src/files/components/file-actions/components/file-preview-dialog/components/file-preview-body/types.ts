// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactElement } from "react";
import type { FileDownload, PreviewKind, RegularFileEntry } from "../../../../../../types.js";

export type FilePreviewBodyProps = {
  readonly file: RegularFileEntry;
  readonly download: FileDownload["download"];
};

export type PreviewerProps = {
  readonly objectUrl: string;
  readonly name: string;
  readonly download: FileDownload["download"];
};

export type Previewer = (props: PreviewerProps) => ReactElement;

export type PreviewerRegistry = Record<PreviewKind, Previewer>;
