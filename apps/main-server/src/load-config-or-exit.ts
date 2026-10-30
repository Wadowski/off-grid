// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { loadConfig } from "./load-config.js";
import { failStartup } from "./fail-startup.js";

export const loadConfigOrExit = () => {
  try {
    return loadConfig();
  } catch (error) {
    return failStartup(error);
  }
};
