// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { FileEntryProps } from "../files/types.js";

export type FileCardProps = FileEntryProps & {
  readonly media?: ReactNode;
};
