// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorTextId } from "../../../../files/types.js";

export type FileDetailsStatusProps =
  | { readonly status: "loading" }
  | {
      readonly status: "failed";
      readonly errorTextId: FilesErrorTextId | null;
      readonly onRetry: () => Promise<void>;
    };
