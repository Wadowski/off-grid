// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventGuestsState } from "../types.js";

export type GuestsSectionProps = {
  readonly state: EventGuestsState;
  readonly nameOf: (userId: string) => string | undefined;
  readonly readOnly: boolean;
};
