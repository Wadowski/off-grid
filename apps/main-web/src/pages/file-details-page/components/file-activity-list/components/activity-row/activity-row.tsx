// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatFileTimestamp } from "../../../../../../files/format-file-timestamp.js";
import { ActivityText } from "./components/activity-text/activity-text.js";
import {
  activityIconBackground,
  activityIconColor,
  activityRowStyle,
  activityRowTextStyle,
} from "./styles.js";
import type { ActivityRowProps } from "./types.js";

export const ActivityRow = ({ entry }: ActivityRowProps) => {
  const { i18n } = useTranslation();
  const isFirstVersion = entry.number === 1;

  return (
    <li style={activityRowStyle} data-testid="file-activity-row">
      <IconTile size="2.5rem" background={activityIconBackground} color={activityIconColor}>
        <MaterialIcon
          name={isFirstVersion ? "upload_file" : "edit_document"}
          size="20px"
          color={activityIconColor}
        />
      </IconTile>
      <div style={activityRowTextStyle}>
        <ActivityText entry={entry} />
        <Text variant="caption" value={formatFileTimestamp(entry.createdAt, i18n.language)} />
      </div>
    </li>
  );
};
