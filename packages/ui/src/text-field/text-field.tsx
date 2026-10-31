// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import {
  textFieldErrorStyle,
  textFieldInputStyle,
  textFieldInvalidBorderStyle,
  textFieldStyle,
  textFieldValidBorderStyle,
} from "./styles.js";
import type { TextFieldProps } from "./types.js";

export const TextField = ({ label, error, id, ...rest }: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined;

  return (
    <div style={textFieldStyle}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="og-focusable"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        style={{
          ...textFieldInputStyle,
          ...(hasError ? textFieldInvalidBorderStyle : textFieldValidBorderStyle),
        }}
        {...rest}
      />
      {hasError && (
        <div id={errorId} style={textFieldErrorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};
