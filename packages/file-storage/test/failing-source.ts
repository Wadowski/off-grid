// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";

export const failingSource = (): Readable =>
  new Readable({
    read() {
      this.destroy(new Error("source failed"));
    },
  });
