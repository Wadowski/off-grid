// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HTMLAttributes, ReactNode } from "react";

export type TagTone = "neutral" | "accent";

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "style" | "className"> & {
  readonly tone?: TagTone;
  readonly children: ReactNode;
};
