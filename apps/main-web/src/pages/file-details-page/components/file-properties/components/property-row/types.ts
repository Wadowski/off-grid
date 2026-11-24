// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { PropertyLabelTextId } from "../../types.js";

export type PropertyRowProps = {
  readonly testId: string;
  readonly labelTextId: PropertyLabelTextId;
  readonly isFirst: boolean;
  readonly children: ReactNode;
};
