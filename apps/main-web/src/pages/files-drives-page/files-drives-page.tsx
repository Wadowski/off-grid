// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link, Navigate, useOutletContext } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { DriveSwitcher } from "../../layouts/files-layout/components/drive-switcher/drive-switcher.js";
import type { DriveSwitcherProps } from "../../layouts/files-layout/components/drive-switcher/types.js";
import { backLinkStyle } from "../files-page/components/back-link/styles.js";
import { filesPageStyle } from "../files-page/styles.js";

export const FilesDrivesPage = () => {
  const narrow = useIsNarrow();
  const switcher = useOutletContext<DriveSwitcherProps>();

  if (!narrow) {
    return <Navigate to="/files" replace />;
  }

  return (
    <div style={filesPageStyle} data-testid="files-drives-page">
      <Link to="/files" style={backLinkStyle} data-testid="files-drives-back-link">
        <MaterialIcon name="arrow_back" size="20px" color={cssVar("color-primary")} />
        <Text variant="label" element="span" textId="files.drives.backToFiles" />
      </Link>
      <Text variant="heading" textId="files.drives.page" />
      <DriveSwitcher {...switcher} />
    </div>
  );
};
