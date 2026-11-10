// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { JoinCodeFormProps } from "./types.js";

export const JoinCodeForm = ({ submitting, errorTextId, onSubmit }: JoinCodeFormProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="join-family-code-form">
      <TextField
        data-testid="join-family-code"
        name="code"
        value={code}
        autoComplete="off"
        spellCheck={false}
        placeholder={t("joinSpace.codePlaceholder")}
        onChange={(event) => setCode(event.target.value)}
        label={<Text variant="label" textId="joinSpace.codeLabel" />}
        error={
          errorTextId === undefined ? undefined : (
            <span role="alert">
              <Text variant="error" textId={errorTextId} />
            </span>
          )
        }
      />
      <Button type="submit" variant="primary" fullWidth disabled={submitting}>
        <Text variant="action" textId="joinSpace.continue" />
      </Button>
    </form>
  );
};
