// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../../../../../icons/material-icon/material-icon.js";
import type { SidebarFamilyCardProps } from "./types.js";

export const SidebarFamilyCard = ({ families }: SidebarFamilyCardProps) => {
  const { t } = useTranslation();
  const [primaryFamily] = families;

  if (primaryFamily === undefined) {
    return null;
  }

  return (
    <section className="og-family-card" data-testid="sidebar-family-card">
      <div className="og-family-card-row">
        <span className="og-family-card-name">
          <MaterialIcon name="group" size="15px" color="var(--og-color-accent)" />
          <Text variant="label" value={primaryFamily.name} />
        </span>
        <span className="og-family-card-count">
          <span className="og-family-card-dot" aria-hidden="true" />
          <Text variant="caption" value={t("shell.familyCount", { count: families.length })} />
        </span>
      </div>
      <div className="og-family-card-row">
        <span />
        <Link to="/" className="og-family-card-manage og-focusable">
          <Text variant="caption" textId="shell.manage" />
        </Link>
      </div>
    </section>
  );
};
