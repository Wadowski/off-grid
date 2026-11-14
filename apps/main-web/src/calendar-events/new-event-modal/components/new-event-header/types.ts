// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type NewEventHeaderProps = {
  readonly narrow: boolean;
  readonly heading: ReactNode;
  readonly cancelButton: ReactNode;
  readonly createButton: ReactNode;
  readonly calendarPicker: ReactNode;
  readonly closeButton: ReactNode;
};
