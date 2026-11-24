// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SegmentedControl, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { tabCountStyle, tabLabelStyle } from "./styles.js";
import type { FileDetailsTab, FileDetailsTabsProps } from "./types.js";

export const FileDetailsTabs = ({ value, activityCount, onChange }: FileDetailsTabsProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl<FileDetailsTab>
      label={t("files.details.tabs.label")}
      value={value}
      onChange={onChange}
      options={[
        {
          value: "details",
          label: <Text variant="action" element="span" textId="files.details.tabs.details" />,
        },
        {
          value: "activity",
          label: (
            <span style={tabLabelStyle}>
              <Text variant="action" element="span" textId="files.details.tabs.activity" />
              {activityCount === null ? null : (
                <Text
                  variant="caption"
                  element="span"
                  value={String(activityCount)}
                  style={tabCountStyle}
                  data-testid="file-details-activity-count"
                />
              )}
            </span>
          ),
        },
      ]}
    />
  );
};
