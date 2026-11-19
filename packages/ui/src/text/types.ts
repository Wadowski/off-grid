// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParseKeys } from "i18next";
import type { CSSProperties, HTMLAttributes } from "react";

export type TextVariant =
  | "brand"
  | "heading"
  | "subheading"
  | "body"
  | "label"
  | "caption"
  | "action"
  | "status"
  | "link"
  | "error";

type TextId = ParseKeys;

export type TextValues = Readonly<Record<string, string | number>>;

type StaticTextContent = {
  readonly textId: TextId;
  readonly values?: TextValues;
  readonly value?: never;
};

type DynamicTextContent = {
  readonly value: string;
  readonly textId?: never;
  readonly values?: never;
};

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "children" | "style" | "className"> & {
  readonly variant: TextVariant;
  readonly style?: CSSProperties;
  readonly element?: "span" | "p";
} & (StaticTextContent | DynamicTextContent);
