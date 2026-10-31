// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { TEXT_VARIANT_ELEMENTS } from "../constants.js";
import { textVariantStyles } from "./styles.js";
import type { TextProps } from "./types.js";

export const Text = ({ variant, textId, value, ...rest }: TextProps) => {
  const { t } = useTranslation();
  const Element = TEXT_VARIANT_ELEMENTS[variant];
  const content = textId === undefined ? value : t(textId);

  return (
    <Element style={textVariantStyles[variant]} {...rest}>
      {content}
    </Element>
  );
};
