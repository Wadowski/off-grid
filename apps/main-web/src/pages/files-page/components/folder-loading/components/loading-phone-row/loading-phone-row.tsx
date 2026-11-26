// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Skeleton } from "@offgrid/ui";
import { loadingPhoneRowStyle, loadingPhoneRowTextStyle } from "./styles.js";

export const LoadingPhoneRow = () => (
  <div style={loadingPhoneRowStyle}>
    <Skeleton width="2.5rem" height="2.5rem" />
    <div style={loadingPhoneRowTextStyle}>
      <Skeleton width="65%" height="0.875rem" />
      <Skeleton width="35%" height="0.75rem" />
    </div>
  </div>
);
