// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CLIENT_REQUEST_HEADER, CLIENT_REQUEST_HEADER_VALUE } from "../constants.js";

export const hasClientRequestHeader = (
  headers: Record<string, string | string[] | undefined>,
): boolean => headers[CLIENT_REQUEST_HEADER] === CLIENT_REQUEST_HEADER_VALUE;
