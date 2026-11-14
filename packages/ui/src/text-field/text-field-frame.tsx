// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { textFieldErrorStyle, textFieldLabelRowStyle, textFieldStyle } from "./styles.js";
import type { TextFieldFrameProps } from "./types.js";

const shellClassName = (invalid: boolean, hasLeading: boolean, hasTrailing: boolean): string =>
  [
    "og-text-field-shell",
    invalid && "og-text-field-invalid",
    hasLeading && "og-text-field-has-leading",
    hasTrailing && "og-text-field-has-trailing",
  ]
    .filter((className): className is string => typeof className === "string")
    .join(" ");

export const TextFieldFrame = ({
  label,
  inputId,
  error,
  leading,
  trailing,
  labelAside,
  footer,
  children,
}: TextFieldFrameProps) => {
  const invalid = error !== undefined;
  const errorId = invalid ? `${inputId}-error` : undefined;

  return (
    <div style={textFieldStyle}>
      <div style={textFieldLabelRowStyle}>
        <label htmlFor={inputId}>{label}</label>
        {labelAside}
      </div>
      <div className={shellClassName(invalid, leading !== undefined, trailing !== undefined)}>
        {leading !== undefined && <span className="og-text-field-leading">{leading}</span>}
        {children({ errorId, invalid })}
        {trailing !== undefined && <span className="og-text-field-trailing">{trailing}</span>}
      </div>
      {footer}
      {errorId !== undefined && (
        <div id={errorId} style={textFieldErrorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};
