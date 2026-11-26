// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webFilesClient } from "../api/web-api-client.js";

export const getUploadLimit = () => webFilesClient.getUploadLimit();
