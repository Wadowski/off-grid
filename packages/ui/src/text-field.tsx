// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId, type CSSProperties, type InputHTMLAttributes } from "react";
import { cssVar } from "./tokens.js";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "className"> & {
  label: string;
  error?: string;
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-1"),
  fontFamily: cssVar("font-family-base"),
  fontSize: cssVar("font-size-md"),
  color: cssVar("color-text"),
};

const labelStyle: CSSProperties = {
  fontWeight: cssVar("font-weight-semibold"),
};

const inputStyle: CSSProperties = {
  padding: cssVar("space-2"),
  borderRadius: cssVar("radius-sm"),
  borderStyle: "solid",
  borderWidth: "1px",
  background: cssVar("color-background"),
  color: cssVar("color-text"),
  font: "inherit",
};

const errorStyle: CSSProperties = {
  margin: 0,
  fontSize: cssVar("font-size-sm"),
  color: cssVar("color-danger"),
};

export function TextField({ label, error, id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined;

  return (
    <div style={fieldStyle}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
      </label>
      <input
        id={inputId}
        className="og-focusable"
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        style={{
          ...inputStyle,
          borderColor: hasError ? cssVar("color-danger") : cssVar("color-border"),
        }}
        {...rest}
      />
      {hasError && (
        <p id={errorId} style={errorStyle}>
          {error}
        </p>
      )}
    </div>
  );
}
