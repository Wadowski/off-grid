// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { API_PORT } from "../constants.js";

export const serverOrigin = (): string =>
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
