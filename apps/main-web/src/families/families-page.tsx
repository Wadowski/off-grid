// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { CreateFamilyForm } from "./create-family-form.js";
import { FamilyList } from "./family-list.js";
import { useFamilies } from "./use-families.js";

export const FamiliesPage = () => {
  const { t } = useTranslation();
  const { families, listStatus, createStatus, submitFamily } = useFamilies();

  return (
    <div style={{ display: "grid", gap: tokens.space[4] }}>
      <h1>{t("families.heading")}</h1>
      <CreateFamilyForm status={createStatus} onSubmit={submitFamily} />
      <FamilyList families={families} listStatus={listStatus} />
    </div>
  );
};
