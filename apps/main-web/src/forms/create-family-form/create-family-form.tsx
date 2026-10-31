// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FormEvent } from "react";
import { useState } from "react";
import { validateFamilyName } from "../../families/validate-family-name.js";
import type { FamilyNameErrorTextId } from "../../types.js";
import { Text } from "@offgrid/ui";
import { FamilyNameField } from "./components/family-name-field/family-name-field.js";
import { FormStatus } from "./components/form-status/form-status.js";
import { SubmitButton } from "./components/submit-button/submit-button.js";
import { createFamilyFormSectionStyle } from "./styles.js";
import type { CreateFamilyFormProps } from "./types.js";

export const CreateFamilyForm = ({ status, onSubmit }: CreateFamilyFormProps) => {
  const [name, setName] = useState("");
  const [nameErrorTextId, setNameErrorTextId] = useState<FamilyNameErrorTextId | undefined>(
    undefined,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorTextId = validateFamilyName(name);
    setNameErrorTextId(errorTextId);
    if (errorTextId !== undefined) {
      return;
    }
    if (await onSubmit(name.trim())) {
      setName("");
    }
  };

  return (
    <section aria-labelledby="create-family-heading" style={createFamilyFormSectionStyle}>
      <Text variant="subheading" id="create-family-heading" textId="families.createHeading" />
      <form data-testid="create-family-form" onSubmit={handleSubmit} noValidate>
        <FamilyNameField value={name} errorTextId={nameErrorTextId} onChange={setName} />
        <SubmitButton status={status} />
      </form>
      <FormStatus status={status} />
    </section>
  );
};
