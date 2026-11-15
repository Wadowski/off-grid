// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventDetailsShellProps } from "../types.js";

export type EventDetailsModalProps = EventDetailsShellProps & {
  readonly onClose: () => void;
};
