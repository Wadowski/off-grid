// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { FileBackTarget } from "../../../../files/types.js";

export type FileDetailsFrameProps = {
  readonly backTarget: FileBackTarget | null;
  readonly children: ReactNode;
};
