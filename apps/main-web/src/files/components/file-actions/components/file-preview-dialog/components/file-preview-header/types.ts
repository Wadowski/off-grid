// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileKind } from "@offgrid/ui";
import type { Ref } from "react";

export type FilePreviewHeaderProps = {
  readonly nameId: string;
  readonly name: string;
  readonly kind: FileKind;
  readonly isDownloading: boolean;
  readonly closeRef: Ref<HTMLButtonElement>;
  readonly onDownload: () => void;
  readonly onClose: () => void;
};
