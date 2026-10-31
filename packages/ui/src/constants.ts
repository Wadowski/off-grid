// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TextVariant } from "./text/types.js";

export const TEXT_VARIANT_ELEMENTS: Record<TextVariant, "h1" | "h2" | "p" | "span"> = {
  brand: "p",
  heading: "h1",
  subheading: "h2",
  body: "p",
  label: "span",
  action: "span",
  status: "p",
  error: "p",
};
