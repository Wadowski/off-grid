// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { clampPercent } from "./clamp-percent.js";
import { progressFillStyle, progressTrackStyle } from "./styles.js";
import type { ProgressBarProps } from "./types.js";

export const ProgressBar = ({ label, percent, testId }: ProgressBarProps) => {
  const value = clampPercent(percent);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      style={progressTrackStyle}
      data-testid={testId}
    >
      <div className="og-progress-fill" style={progressFillStyle(value)} />
    </div>
  );
};
