// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import { textFieldErrorStyle, textFieldLabelRowStyle, textFieldStyle } from "./styles.js";
import type { TextFieldProps } from "./types.js";

const shellClassName = (invalid: boolean, hasLeading: boolean, hasTrailing: boolean): string =>
  [
    "og-text-field-shell",
    invalid && "og-text-field-invalid",
    hasLeading && "og-text-field-has-leading",
    hasTrailing && "og-text-field-has-trailing",
  ]
    .filter((className): className is string => typeof className === "string")
    .join(" ");

const inputClassName = (mono: boolean, variant: "default" | "title"): string =>
  ["og-input", mono && "og-text-field-mono", variant === "title" && "og-text-field-title"]
    .filter((className): className is string => typeof className === "string")
    .join(" ");

export const TextField = ({
  label,
  error,
  id,
  leading,
  trailing,
  labelAside,
  footer,
  mono = false,
  variant = "default",
  ...rest
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined;

  return (
    <div style={textFieldStyle}>
      <div style={textFieldLabelRowStyle}>
        <label htmlFor={inputId}>{label}</label>
        {labelAside}
      </div>
      <div className={shellClassName(hasError, leading !== undefined, trailing !== undefined)}>
        {leading !== undefined && <span className="og-text-field-leading">{leading}</span>}
        <input
          id={inputId}
          className={inputClassName(mono, variant)}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {trailing !== undefined && <span className="og-text-field-trailing">{trailing}</span>}
      </div>
      {footer}
      {hasError && (
        <div id={errorId} style={textFieldErrorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};
