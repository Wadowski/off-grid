// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useOutletContext } from "react-router-dom";
import { CreateFamilyForm } from "../../forms/create-family-form/create-family-form.js";
import { FamilyList } from "../../lists/family-list/family-list.js";
import type { FamiliesContext } from "../../types.js";
import { familiesPageStyle } from "./styles.js";

export const FamiliesPage = () => {
  const { families, listStatus, createStatus, submitFamily } = useOutletContext<FamiliesContext>();

  return (
    <div style={familiesPageStyle}>
      <Text variant="heading" textId="families.heading" />
      <CreateFamilyForm status={createStatus} onSubmit={submitFamily} />
      <FamilyList families={families} listStatus={listStatus} />
    </div>
  );
};
