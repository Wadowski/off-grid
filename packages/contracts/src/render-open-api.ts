// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { buildOpenApiDocument } from "./build-open-api-document.js";

export const renderOpenApi = (): string => {
  return `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`;
};
