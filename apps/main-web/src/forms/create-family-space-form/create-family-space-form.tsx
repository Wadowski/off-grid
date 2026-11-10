// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useState } from "react";
import { CreateFamilyForm } from "../create-family-form/create-family-form.js";
import { AccentPicker } from "./components/accent-picker/accent-picker.js";
import { PurposePicker } from "./components/purpose-picker/purpose-picker.js";
import type { AccentId, SpacePurposeId } from "./constants.js";
import { createFamilySpaceFormStyle } from "./styles.js";
import type { CreateFamilySpaceFormProps } from "./types.js";

export const CreateFamilySpaceForm = ({ status, onSubmit }: CreateFamilySpaceFormProps) => {
  const [accent, setAccent] = useState<AccentId>("blue");
  const [purpose, setPurpose] = useState<SpacePurposeId>("household");

  return (
    <CreateFamilyForm status={status} onSubmit={onSubmit}>
      <div style={createFamilySpaceFormStyle}>
        <AccentPicker value={accent} onChange={setAccent} />
        <PurposePicker value={purpose} onChange={setPurpose} />
      </div>
    </CreateFamilyForm>
  );
};
