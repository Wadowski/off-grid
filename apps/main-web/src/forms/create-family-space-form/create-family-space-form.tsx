// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyAccent, FamilyPurpose } from "@offgrid/contracts";
import { useState } from "react";
import {
  FAMILY_ACCENT_COLORS,
  FAMILY_ACCENT_LABEL_TEXT_IDS,
  FAMILY_ACCENTS,
} from "../../families/family-appearance.js";
import { CreateFamilyForm } from "../create-family-form/create-family-form.js";
import { SwatchPicker } from "../shared/swatch-picker/swatch-picker.js";
import { PurposePicker } from "./components/purpose-picker/purpose-picker.js";
import { createFamilySpaceFormStyle } from "./styles.js";
import type { CreateFamilySpaceFormProps } from "./types.js";

export const CreateFamilySpaceForm = ({ status, onSubmit }: CreateFamilySpaceFormProps) => {
  const [accent, setAccent] = useState<FamilyAccent>("blue");
  const [purpose, setPurpose] = useState<FamilyPurpose>("household");

  return (
    <CreateFamilyForm status={status} onSubmit={(name) => onSubmit(name, { accent, purpose })}>
      <div style={createFamilySpaceFormStyle}>
        <SwatchPicker
          headingId="accent-picker-heading"
          headingTextId="families.accentHeading"
          options={FAMILY_ACCENTS}
          value={accent}
          onChange={setAccent}
          labelTextIds={FAMILY_ACCENT_LABEL_TEXT_IDS}
          backgroundOf={(option) => FAMILY_ACCENT_COLORS[option].background}
          testIdPrefix="family-space-accent"
        />
        <PurposePicker value={purpose} onChange={setPurpose} />
      </div>
    </CreateFamilyForm>
  );
};
