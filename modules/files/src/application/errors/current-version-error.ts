// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CURRENT_VERSION_MESSAGE } from "../../constants.js";

export class CurrentVersionError extends Error {
  constructor() {
    super(CURRENT_VERSION_MESSAGE);
    this.name = "CurrentVersionError";
  }
}
