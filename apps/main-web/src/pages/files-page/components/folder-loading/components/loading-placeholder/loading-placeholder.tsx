// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { LoadingGridCard } from "../loading-grid-card/loading-grid-card.js";
import { LoadingPhoneRow } from "../loading-phone-row/loading-phone-row.js";
import { LoadingTableRow } from "../loading-table-row/loading-table-row.js";
import type { LoadingPlaceholderProps } from "./types.js";

export const LoadingPlaceholder = ({ layout }: LoadingPlaceholderProps) => {
  if (layout === "grid") {
    return <LoadingGridCard />;
  }
  if (layout === "phone") {
    return <LoadingPhoneRow />;
  }
  return <LoadingTableRow />;
};
