// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LogSink } from "./types.js";

export const writeToStdout: LogSink = (line) => {
  process.stdout.write(`${line}\n`);
};
