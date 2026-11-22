// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { DriveSwitcherGroup } from "./components/drive-switcher-group/drive-switcher-group.js";
import { splitDrivesByKind } from "./split-drives-by-kind.js";
import {
  driveSwitcherCountStyle,
  driveSwitcherErrorStyle,
  driveSwitcherHeaderStyle,
  driveSwitcherNavStyle,
  driveSwitcherStyle,
  driveSwitcherTitleStyle,
} from "./styles.js";
import type { DriveSwitcherProps } from "./types.js";

export const DriveSwitcher = ({
  drives,
  status,
  errorTextId,
  activeDriveId,
  onRetry,
}: DriveSwitcherProps) => {
  const { t } = useTranslation();
  const { personal, family } = splitDrivesByKind(drives);

  return (
    <aside
      style={driveSwitcherStyle}
      aria-label={t("files.drives.nav")}
      data-testid="drive-switcher"
    >
      <div style={driveSwitcherHeaderStyle}>
        <div style={driveSwitcherTitleStyle}>
          <MaterialIcon name="database" size="20px" color={cssVar("color-primary")} />
          <Text variant="subheading" element="span" textId="files.drives.heading" />
        </div>
        {status === "ready" ? (
          <Text
            variant="label"
            element="span"
            textId="files.drives.count"
            values={{ count: drives.length }}
            style={driveSwitcherCountStyle}
            data-testid="drive-switcher-count"
          />
        ) : null}
      </div>
      <nav
        aria-label={t("files.drives.nav")}
        aria-busy={status === "loading"}
        style={driveSwitcherNavStyle}
      >
        {status === "loading" && (
          <Text
            variant="body"
            textId="files.drives.loading"
            role="status"
            data-testid="drive-switcher-loading"
          />
        )}
        {status === "failed" && (
          <div style={driveSwitcherErrorStyle}>
            <Text
              variant="error"
              role="alert"
              textId={errorTextId ?? "files.errors.failed"}
              data-testid="drive-switcher-error"
            />
            <Button variant="secondary" onClick={onRetry} data-testid="drive-switcher-retry">
              <Text variant="action" textId="files.folder.retry" />
            </Button>
          </div>
        )}
        {status === "ready" && (
          <>
            <DriveSwitcherGroup
              captionTextId="files.drives.personal"
              drives={personal}
              activeDriveId={activeDriveId}
            />
            <DriveSwitcherGroup
              captionTextId="files.drives.family"
              captionValues={{ count: family.length }}
              drives={family}
              activeDriveId={activeDriveId}
              emptyTextId="files.drives.emptyFamily"
            />
          </>
        )}
      </nav>
    </aside>
  );
};
