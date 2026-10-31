// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Card, tokens } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { FamilySummary, ListStatus } from "../types.js";

type FamilyListProps = {
  readonly families: readonly FamilySummary[];
  readonly listStatus: ListStatus;
};

export const FamilyList = ({ families, listStatus }: FamilyListProps) => {
  const { t } = useTranslation();

  if (listStatus === "loading" && families.length === 0) {
    return <p role="status">{t("families.loading")}</p>;
  }
  if (listStatus === "failed") {
    return <p role="alert">{t("families.listFailed")}</p>;
  }
  if (families.length === 0) {
    return <p data-testid="family-list-empty">{t("families.empty")}</p>;
  }

  return (
    <section aria-labelledby="family-list-heading">
      <h2 id="family-list-heading">{t("families.listHeading")}</h2>
      <ul
        data-testid="family-list"
        style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: tokens.space[3] }}
      >
        {families.map((family) => (
          <li key={family.id} data-testid="family-list-item">
            <Card>{family.name}</Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
