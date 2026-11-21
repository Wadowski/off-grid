// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { LAST_EVENT_ID_HEADER } from "./constants.js";

export const streamRequestHeaders = (lastId: string | undefined): Record<string, string> =>
  lastId === undefined
    ? { accept: "text/event-stream" }
    : { accept: "text/event-stream", [LAST_EVENT_ID_HEADER]: lastId };
