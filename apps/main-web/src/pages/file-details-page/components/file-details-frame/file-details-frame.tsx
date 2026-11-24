// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileDetailsHeader } from "../file-details-header/file-details-header.js";
import { fileDetailsFrameStyle } from "./styles.js";
import type { FileDetailsFrameProps } from "./types.js";

export const FileDetailsFrame = ({ backTarget, children }: FileDetailsFrameProps) => (
  <div style={fileDetailsFrameStyle} data-testid="file-details-page">
    <FileDetailsHeader backTarget={backTarget} />
    {children}
  </div>
);
