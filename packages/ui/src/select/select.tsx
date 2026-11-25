// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { selectAccentStyle, selectStyle } from "./styles.js";
import type { SelectProps, Translate } from "./types.js";

export const Select = ({
  options,
  accent,
  variant = "default",
  labelTextId,
  ...rest
}: SelectProps) => {
  const { t } = useTranslation();
  const translate = t as unknown as Translate;

  return (
    <select
      aria-label={labelTextId === undefined ? undefined : translate(labelTextId)}
      className={variant === "field" ? "og-focusable og-select-field" : "og-focusable"}
      style={variant === "field" ? undefined : { ...selectStyle, ...selectAccentStyle(accent) }}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.labelTextId === undefined ? option.label : translate(option.labelTextId)}
        </option>
      ))}
    </select>
  );
};
