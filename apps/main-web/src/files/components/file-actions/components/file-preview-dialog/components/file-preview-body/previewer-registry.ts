// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ImagePreviewer } from "./components/image-previewer/image-previewer.js";
import { PdfPreviewer } from "./components/pdf-previewer/pdf-previewer.js";
import type { PreviewerRegistry } from "./types.js";

export const PREVIEWERS: PreviewerRegistry = {
  image: ImagePreviewer,
  pdf: PdfPreviewer,
};
