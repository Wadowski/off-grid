// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import {
  textFieldErrorStyle,
  textFieldLabelRowStyle,
  textFieldStyle,
} from "../text-field/styles.js";
import type { TextareaProps } from "./types.js";

export const Textarea = ({ label, error, id, ...rest }: TextareaProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined;

  return (
    <div style={textFieldStyle}>
      <div style={textFieldLabelRowStyle}>
        <label htmlFor={inputId}>{label}</label>
      </div>
      <div
        className={hasError ? "og-text-field-shell og-text-field-invalid" : "og-text-field-shell"}
      >
        <textarea
          id={inputId}
          className="og-input og-textarea"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
      </div>
      {hasError && (
        <div id={errorId} style={textFieldErrorStyle}>
          {error}
        </div>
      )}
    </div>
  );
};
