// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";

export const notificationCardActionRowStyle: CSSProperties = {
  display: "flex",
  paddingLeft: `calc(${cssVar("space-9")} + ${cssVar("space-3")})`,
};
