// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useId } from "react";
import { TextFieldFrame } from "../text-field/text-field-frame.js";
import type { TextareaProps } from "./types.js";

export const Textarea = ({ label, error, id, ...rest }: TextareaProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <TextFieldFrame label={label} inputId={inputId} error={error}>
      {({ errorId, invalid }) => (
        <textarea
          id={inputId}
          className="og-input og-textarea"
          aria-invalid={invalid}
          aria-describedby={errorId}
          {...rest}
        />
      )}
    </TextFieldFrame>
  );
};
