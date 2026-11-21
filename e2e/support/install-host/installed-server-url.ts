// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INSTALL_SERVER_PORT } from "../release-source/constants.js";

export const installedServerUrl = (): string => `http://127.0.0.1:${INSTALL_SERVER_PORT}`;
