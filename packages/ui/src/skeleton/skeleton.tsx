// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { skeletonStyle } from "./styles.js";
import type { SkeletonProps } from "./types.js";

export const Skeleton = ({ width, height, shape = "rounded", testId }: SkeletonProps) => (
  <span
    className="og-pulse"
    aria-hidden="true"
    style={skeletonStyle(width, height, shape)}
    data-testid={testId}
  />
);
