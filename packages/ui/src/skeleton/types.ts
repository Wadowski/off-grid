// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type SkeletonShape = "rounded" | "circle";

export type SkeletonProps = {
  readonly width: string;
  readonly height: string;
  readonly shape?: SkeletonShape;
  readonly testId?: string;
};
