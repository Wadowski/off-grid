// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fileDetailsBackLinkStyle, fileDetailsHeaderStyle } from "./styles.js";
import type { FileDetailsHeaderProps } from "./types.js";

export const FileDetailsHeader = ({ backTarget }: FileDetailsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header style={fileDetailsHeaderStyle} data-testid="file-details-header">
      {backTarget === null ? null : (
        <Link
          to={backTarget.to}
          className="og-focusable"
          aria-label={t("files.details.back", { name: backTarget.name })}
          style={fileDetailsBackLinkStyle}
          data-testid="file-details-back"
        >
          <MaterialIcon name="arrow_back" size="24px" color={cssVar("color-primary")} />
        </Link>
      )}
      <Text variant="heading" textId="files.details.heading" />
    </header>
  );
};
