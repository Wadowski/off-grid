// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FormEvent } from "react";
import { useState } from "react";
import { validateFamilyName } from "../../families/validate-family-name.js";
import type { FamilyNameErrorTextId } from "../../types.js";
import { FamilyNameField } from "../create-family-form/components/family-name-field/family-name-field.js";
import { FormStatus } from "../create-family-form/components/form-status/form-status.js";
import { SubmitButton } from "../create-family-form/components/submit-button/submit-button.js";
import { AccentPicker } from "./components/accent-picker/accent-picker.js";
import { PurposePicker } from "./components/purpose-picker/purpose-picker.js";
import type { AccentId, SpacePurposeId } from "./constants.js";
import { createFamilySpaceFormStyle } from "./styles.js";
import type { CreateFamilySpaceFormProps } from "./types.js";

export const CreateFamilySpaceForm = ({ status, onSubmit }: CreateFamilySpaceFormProps) => {
  const [name, setName] = useState("");
  const [nameErrorTextId, setNameErrorTextId] = useState<FamilyNameErrorTextId | undefined>(
    undefined,
  );
  const [accent, setAccent] = useState<AccentId>("blue");
  const [purpose, setPurpose] = useState<SpacePurposeId>("household");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorTextId = validateFamilyName(name);
    setNameErrorTextId(errorTextId);
    if (errorTextId !== undefined) {
      return;
    }
    await onSubmit(name.trim());
  };

  return (
    <div>
      <form
        data-testid="create-family-space-form"
        style={createFamilySpaceFormStyle}
        onSubmit={handleSubmit}
        noValidate
      >
        <FamilyNameField value={name} errorTextId={nameErrorTextId} onChange={setName} />
        <AccentPicker value={accent} onChange={setAccent} />
        <PurposePicker value={purpose} onChange={setPurpose} />
        <SubmitButton status={status} />
      </form>
      <FormStatus status={status} />
    </div>
  );
};
