// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties, ReactNode } from "react";
import { cssVar } from "./tokens.js";

const cardStyle: CSSProperties = {
  padding: cssVar("space-4"),
  borderRadius: cssVar("radius-md"),
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  boxShadow: cssVar("elevation-1"),
};

export const Card = ({ children }: { children: ReactNode }) => {
  return <div style={cardStyle}>{children}</div>;
};
