// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Skeleton } from "@offgrid/ui";
import { loadingGridCardStyle } from "./styles.js";

export const LoadingGridCard = () => (
  <div style={loadingGridCardStyle}>
    <Skeleton width="100%" height="5rem" />
    <Skeleton width="70%" height="0.875rem" />
  </div>
);
