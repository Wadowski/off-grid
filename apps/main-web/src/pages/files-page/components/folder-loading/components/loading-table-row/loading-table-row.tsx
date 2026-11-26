// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Skeleton } from "@offgrid/ui";
import { loadingTableRowStyle } from "./styles.js";

export const LoadingTableRow = () => (
  <div style={loadingTableRowStyle}>
    <Skeleton width="1.25rem" height="1.25rem" shape="circle" />
    <Skeleton width="60%" height="0.875rem" />
    <Skeleton width="5rem" height="0.75rem" />
    <Skeleton width="3.5rem" height="0.75rem" />
  </div>
);
