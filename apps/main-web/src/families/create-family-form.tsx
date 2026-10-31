// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, TextField, tokens } from "@offgrid/ui";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { CreateFamilyStatus } from "../types.js";
import { createFamilyStatusMessage } from "./create-family-status-message.js";
import { validateFamilyName } from "./validate-family-name.js";

type CreateFamilyFormProps = {
  readonly status: CreateFamilyStatus;
  readonly onSubmit: (name: string) => Promise<boolean>;
};

export const CreateFamilyForm = ({ status, onSubmit }: CreateFamilyFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const busy = status === "submitting" || status === "waiting-for-list";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorKey = validateFamilyName(name);
    setNameError(errorKey === undefined ? undefined : t(errorKey));
    if (errorKey !== undefined) {
      return;
    }
    if (await onSubmit(name.trim())) {
      setName("");
    }
  };

  return (
    <section aria-labelledby="create-family-heading" style={{ marginBlockEnd: tokens.space[5] }}>
      <h2 id="create-family-heading">{t("families.createHeading")}</h2>
      <form data-testid="create-family-form" onSubmit={handleSubmit} noValidate>
        <TextField
          data-testid="create-family-name"
          label={t("families.nameLabel")}
          name="name"
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
        />
        <div style={{ marginBlockStart: tokens.space[3] }}>
          <Button type="submit" data-testid="create-family-submit" disabled={busy}>
            {t("families.submit")}
          </Button>
        </div>
      </form>
      <p data-testid="create-family-status" role="status">
        {createFamilyStatusMessage(status, t)}
      </p>
    </section>
  );
};
