// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { compose } from "../stack.js";

export const runUpdaterCommand = (args: readonly string[]): Promise<string> => {
  const project = process.env.E2E_COMPOSE_PROJECT;
  if (project === undefined) {
    throw new Error("The updater command needs the compose stack that this run started.");
  }
  return compose(project, ["exec", "-T", "-u", "root", "updater", ...args]);
};
