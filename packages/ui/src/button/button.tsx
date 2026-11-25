// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import {
  buttonAlignStyles,
  buttonBaseStyle,
  buttonDisabledStyle,
  buttonFullWidthStyle,
  buttonSizeStyles,
  buttonVariantStyles,
} from "./styles.js";
import type { ButtonProps, Translate } from "./types.js";

export const Button = ({
  variant = "primary",
  size = "medium",
  align = "center",
  fullWidth = false,
  type = "button",
  as: Element = "button",
  ariaLabelTextId,
  ...rest
}: ButtonProps) => {
  const { t } = useTranslation();
  const translate = t as unknown as Translate;

  return (
    <Element
      {...(Element === "button" ? { type } : {})}
      className="og-focusable"
      style={{
        ...buttonBaseStyle,
        ...buttonVariantStyles[variant],
        ...buttonSizeStyles[size],
        ...buttonAlignStyles[align],
        ...(fullWidth ? buttonFullWidthStyle : {}),
        ...(rest.disabled === true ? buttonDisabledStyle : {}),
      }}
      {...rest}
      aria-label={ariaLabelTextId === undefined ? rest["aria-label"] : translate(ariaLabelTextId)}
    />
  );
};
