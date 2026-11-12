// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";

export type ViewSegmentedControlProps = {
  readonly value: CalendarViewKind;
  readonly onChange: (view: CalendarViewKind) => void;
};
