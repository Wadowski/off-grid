// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cardStyle } from "./styles.js";
import type { CardProps } from "./types.js";

export const Card = ({ children }: CardProps) => {
  return <div style={cardStyle}>{children}</div>;
};
