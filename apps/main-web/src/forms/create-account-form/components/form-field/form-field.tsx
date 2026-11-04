// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useId } from "react";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import {
  fieldStyle,
  inputStyle,
  labelRowStyle,
  shellStyle,
  iconSlotStyle,
  trailingSlotStyle,
  errorStyle,
  labelStyle,
} from "./styles.js";
import type { FormFieldProps } from "./types.js";

export const FormField = ({
  testId,
  name,
  labelTextId,
  icon,
  type,
  value,
  onChange,
  autoComplete,
  mono = false,
  errorTextId,
  trailing,
  trailingInset = "status",
  labelAside,
  footer,
}: FormFieldProps) => {
  const narrow = useIsNarrow();
  const generatedId = useId();
  const inputId = `${generatedId}-input`;
  const errorId = `${generatedId}-error`;

  return (
    <div style={fieldStyle}>
      <div style={labelRowStyle}>
        <label htmlFor={inputId} style={labelStyle}>
          <Text variant="label" textId={labelTextId} />
        </label>
        {labelAside}
      </div>
      <div
        className={narrow ? "og-input-shell" : undefined}
        style={shellStyle(narrow, errorTextId !== undefined)}
      >
        <span style={iconSlotStyle(narrow)}>
          <MaterialIcon
            name={icon}
            size={narrow ? "20px" : "18px"}
            color="var(--og-color-outline)"
          />
        </span>
        <input
          id={inputId}
          data-testid={testId}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={narrow ? undefined : "og-input"}
          aria-invalid={errorTextId !== undefined}
          aria-describedby={errorTextId === undefined ? undefined : errorId}
          style={inputStyle(narrow, mono, trailing !== undefined, errorTextId !== undefined)}
        />
        {trailing !== undefined && (
          <span style={trailingSlotStyle(narrow, trailingInset)}>{trailing}</span>
        )}
      </div>
      {footer}
      {errorTextId !== undefined && (
        <div id={errorId} style={errorStyle}>
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
    </div>
  );
};
