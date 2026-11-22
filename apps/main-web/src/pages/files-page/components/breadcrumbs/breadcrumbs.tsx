// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { BreadcrumbItem } from "./components/breadcrumb-item/breadcrumb-item.js";
import { breadcrumbListStyle, breadcrumbsStyle } from "./styles.js";
import type { BreadcrumbsProps } from "./types.js";

export const Breadcrumbs = ({ driveId, breadcrumbs, isBusy, phone }: BreadcrumbsProps) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("files.breadcrumbs.label")}
      aria-busy={isBusy}
      data-testid="files-breadcrumbs"
      style={breadcrumbsStyle}
    >
      <ol style={breadcrumbListStyle(phone)}>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem
            key={`${crumb.kind}-${crumb.id}`}
            driveId={driveId}
            crumb={crumb}
            index={index}
            isCurrent={index === breadcrumbs.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
};
