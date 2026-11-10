// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
import { useState } from "react";
import { CreateFamilyForm } from "../create-family-form/create-family-form.js";
import { AccentPicker } from "./components/accent-picker/accent-picker.js";
import { PurposePicker } from "./components/purpose-picker/purpose-picker.js";
import { createFamilySpaceFormStyle } from "./styles.js";
import type { CreateFamilySpaceFormProps } from "./types.js";

export const CreateFamilySpaceForm = ({ status, onSubmit }: CreateFamilySpaceFormProps) => {
  const [accent, setAccent] = useState<FamilyAccent>("blue");
  const [purpose, setPurpose] = useState<FamilyPurpose>("household");

  return (
    <CreateFamilyForm status={status} onSubmit={(name) => onSubmit(name, { accent, purpose })}>
      <div style={createFamilySpaceFormStyle}>
        <AccentPicker value={accent} onChange={setAccent} />
        <PurposePicker value={purpose} onChange={setPurpose} />
      </div>
    </CreateFamilyForm>
  );
};
