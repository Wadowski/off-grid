// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { TEXT_VARIANT_ELEMENTS } from "../constants.js";
import { textVariantStyles } from "./styles.js";
import type { TextProps, TextValues } from "./types.js";

type Translate = (key: string, values?: TextValues) => string;

export const Text = ({ variant, textId, value, values, style, ...rest }: TextProps) => {
  const { t } = useTranslation();
  const translate = t as unknown as Translate;
  const Element = TEXT_VARIANT_ELEMENTS[variant];
  const content = textId === undefined ? value : translate(textId, values);

  return (
    <Element style={{ ...textVariantStyles[variant], ...style }} {...rest}>
      {content}
    </Element>
  );
};
