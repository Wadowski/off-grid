// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { useState } from "react";
import { webAdminClient } from "../../../../api/web-api-client.js";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { iconTileStyle } from "../../../settings-page/components/settings-link-row/styles.js";
import {
  sectionCardStyle,
  sectionHeaderStyle,
  sectionStyle,
} from "../../../settings-page/components/settings-section/styles.js";
import {
  adminNoticeStyle,
  adminRowMainStyle,
  adminRowStyle,
  adminRowTextStyle,
} from "../../styles.js";
import type { AdminRegistrationSectionProps } from "./types.js";

export const AdminRegistrationSection = ({
  registrationOpen,
  onChange,
}: AdminRegistrationSectionProps) => {
  const [saveFailed, setSaveFailed] = useState(false);

  const handleToggle = async (open: boolean) => {
    setSaveFailed(false);
    onChange(open);
    try {
      const saved = await webAdminClient.updateInstanceSettings({ registrationOpen: open });
      onChange(saved.registrationOpen);
    } catch {
      onChange(!open);
      setSaveFailed(true);
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <Text variant="caption" textId="admin.registrationHeading" />
      </div>
      <div style={sectionCardStyle}>
        <div style={adminRowStyle(true)}>
          <div style={adminRowMainStyle}>
            <span style={iconTileStyle("accent")} aria-hidden="true">
              <MaterialIcon name="person_add" size="19px" color="currentColor" />
            </span>
            <div style={adminRowTextStyle}>
              <Checkbox
                data-testid="admin-registration-toggle"
                checked={registrationOpen}
                onChange={(event) => void handleToggle(event.target.checked)}
                label={<Text variant="label" textId="admin.registrationToggle" />}
              />
              <Text variant="status" textId="admin.registrationHelp" />
            </div>
          </div>
        </div>
        {saveFailed && (
          <div style={adminNoticeStyle}>
            <Text variant="error" textId="admin.saveFailed" />
          </div>
        )}
      </div>
    </section>
  );
};
