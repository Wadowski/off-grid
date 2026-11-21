// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FAKE_RELEASE_HOST_NAME } from "../release-source/constants.js";
import { releaseSourcePort } from "../release-source/release-source-port.js";

export const expectedReleaseHost = (): string => `${FAKE_RELEASE_HOST_NAME}:${releaseSourcePort()}`;
