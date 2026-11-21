// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IMAGE_NAMES, STACK_VERSION } from "./constants.js";
import type { ReleaseService } from "./types.js";

export const localImageName = (service: ReleaseService, version: string): string =>
  `${IMAGE_NAMES[service]}:${version}`;

export const stackImageName = (service: ReleaseService): string =>
  localImageName(service, STACK_VERSION);
