// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type DateTimeBlockProps = {
  readonly caption: ReactNode;
  readonly dateLabel: ReactNode;
  readonly timeLabel: ReactNode;
  readonly date: string;
  readonly time: string;
  readonly showTime: boolean;
  readonly onDate: (value: string) => void;
  readonly onTime: (value: string) => void;
};
