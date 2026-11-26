// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { Button } from "../button/button.js";
import { visuallyHiddenStyle } from "../visually-hidden/styles.js";
import type { FilePickerButtonProps } from "./types.js";

export const FilePickerButton = ({
  children,
  ariaLabel,
  variant,
  size,
  disabled = false,
  ariaDescribedBy,
  onFilesPicked,
  testId,
  inputTestId,
}: FilePickerButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length > 0) {
      onFilesPicked(files);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        onClick={() => inputRef.current?.click()}
        data-testid={testId}
      >
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={handleChange}
        style={visuallyHiddenStyle}
        data-testid={inputTestId}
      />
    </>
  );
};
