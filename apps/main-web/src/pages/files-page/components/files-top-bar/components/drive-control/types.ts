// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../../../types.js";

export type DriveControlProps = {
  readonly status: ListStatus;
  readonly activeDriveName: string | null;
};

export type DriveControlText =
  | {
      readonly kind: "text";
      readonly textId: "files.topBar.driveLoading" | "files.topBar.driveUnknown";
    }
  | { readonly kind: "name"; readonly name: string };
