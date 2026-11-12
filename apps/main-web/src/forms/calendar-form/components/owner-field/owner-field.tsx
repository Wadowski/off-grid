// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Select, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { FamilySummary } from "../../../../types.js";
import { ownerSelectLabelStyle, ownerTextStyle } from "../../styles.js";

type OwnerFieldProps =
  | {
      readonly mode: "create";
      readonly families: readonly FamilySummary[];
      readonly value: string;
      readonly onChange: (familyId: string) => void;
    }
  | { readonly mode: "edit"; readonly ownerFamilyName: string | undefined };

export const OwnerField = (props: OwnerFieldProps) => {
  const { t } = useTranslation();

  if (props.mode === "edit") {
    return (
      <div style={ownerTextStyle}>
        <Text variant="label" textId="calendar.calendars.owner" />
        {props.ownerFamilyName === undefined ? (
          <Text variant="body" textId="calendar.calendars.personal" />
        ) : (
          <Text variant="body" value={props.ownerFamilyName} />
        )}
      </div>
    );
  }

  const options = [
    { value: "", label: t("calendar.calendars.ownerSelf") },
    ...props.families.map((family) => ({ value: family.id, label: family.name })),
  ];

  return (
    <label style={ownerSelectLabelStyle}>
      <Text variant="label" textId="calendar.calendars.owner" />
      <Select
        name="owner"
        data-testid="calendar-owner"
        value={props.value}
        options={options}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  );
};
