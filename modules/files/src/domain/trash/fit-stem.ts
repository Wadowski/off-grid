// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILE_NAME_MAX_LENGTH } from "@offgrid/contracts";

export const fitStem = (stem: string, suffix: string, extension: string): string =>
  stem.slice(0, Math.max(0, FILE_NAME_MAX_LENGTH - suffix.length - extension.length));
