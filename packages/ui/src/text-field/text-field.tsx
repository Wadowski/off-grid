// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import { TextFieldFrame } from "./text-field-frame.js";
import type { TextFieldProps } from "./types.js";

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

  return (
    <TextFieldFrame
      label={label}
      inputId={inputId}
      error={error}
      leading={leading}
      trailing={trailing}
      labelAside={labelAside}
      footer={footer}
    >
      {({ errorId, invalid }) => (
        <input
          id={inputId}
          className={inputClassName(mono, variant)}
          aria-invalid={invalid}
          aria-describedby={errorId}
          {...rest}
        />
      )}
    </TextFieldFrame>
  );
};
