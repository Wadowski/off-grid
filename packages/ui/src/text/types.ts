// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { HTMLAttributes } from "react";

export type TextVariant =
  "brand" | "heading" | "subheading" | "body" | "label" | "caption" | "action" | "status" | "error";

type TextId = ParseKeys;

type StaticTextContent = {
  readonly textId: TextId;
  readonly value?: never;
};

type DynamicTextContent = {
  readonly value: string;
  readonly textId?: never;
};

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "children" | "style" | "className"> & {
  readonly variant: TextVariant;
} & (StaticTextContent | DynamicTextContent);
