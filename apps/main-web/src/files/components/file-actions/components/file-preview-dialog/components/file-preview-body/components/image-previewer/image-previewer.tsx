// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { imagePreviewerStyle } from "./styles.js";
import type { PreviewerProps } from "../../types.js";

export const ImagePreviewer = ({ objectUrl, name }: PreviewerProps) => (
  <img src={objectUrl} alt={name} style={imagePreviewerStyle} data-testid="file-preview-image" />
);
