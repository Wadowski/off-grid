// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { settingsIconColors } from "../../../../../settings-page/components/settings-link-row/styles.js";
import { adminRowMainStyle, adminRowStyle, adminRowTextStyle } from "../../../../styles.js";
import { formatUpdateTime } from "../../format-update-time.js";
import { versionPairStyle } from "./styles.js";
import type { UpdateVersionsRowProps } from "./types.js";

export const UpdateVersionsRow = ({
  isFirst,
  currentVersion,
  latestVersion,
  checkedAt,
}: UpdateVersionsRowProps) => (
  <div style={adminRowStyle(isFirst)}>
    <div style={adminRowMainStyle}>
      <IconTile size="2rem" {...settingsIconColors("accent")}>
        <MaterialIcon name="system_update" size="19px" color="currentColor" />
      </IconTile>
      <div style={adminRowTextStyle}>
        <div style={versionPairStyle}>
          <Text variant="caption" textId="admin.update.runningVersion" />
          <Text variant="body" value={currentVersion} />
        </div>
        <div style={versionPairStyle}>
          <Text variant="caption" textId="admin.update.latestVersion" />
          {latestVersion === null ? (
            <Text variant="body" textId="admin.update.notChecked" />
          ) : (
            <Text variant="body" value={latestVersion} />
          )}
        </div>
        <div style={versionPairStyle}>
          <Text variant="caption" textId="admin.update.lastChecked" />
          {checkedAt === null ? (
            <Text variant="body" textId="admin.update.notChecked" />
          ) : (
            <Text variant="body" value={formatUpdateTime(checkedAt)} />
          )}
        </div>
      </div>
    </div>
  </div>
);
