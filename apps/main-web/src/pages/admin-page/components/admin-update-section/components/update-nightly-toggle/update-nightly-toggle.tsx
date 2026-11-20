// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { useEffect, useState } from "react";
import { webSystemClient } from "../../../../../../api/web-api-client.js";
import { settingsIconColors } from "../../../../../settings-page/components/settings-link-row/styles.js";
import {
  adminNoticeStyle,
  adminRowMainStyle,
  adminRowStyle,
  adminRowTextStyle,
} from "../../../../styles.js";
import { nightlyTextStyle } from "./styles.js";
import type { UpdateNightlyToggleProps } from "./types.js";

export const UpdateNightlyToggle = ({ nightlyEnabled }: UpdateNightlyToggleProps) => {
  const [enabled, setEnabled] = useState(nightlyEnabled);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setEnabled(nightlyEnabled);
  }, [nightlyEnabled]);

  const handleToggle = async (next: boolean) => {
    setSaveFailed(false);
    setEnabled(next);
    try {
      const saved = await webSystemClient.setNightlyUpdate(next);
      setEnabled(saved.enabled);
    } catch {
      setEnabled(!next);
      setSaveFailed(true);
    }
  };

  return (
    <>
      <div style={adminRowStyle(false)}>
        <div style={adminRowMainStyle}>
          <IconTile size="2rem" {...settingsIconColors("accent")}>
            <MaterialIcon name="nightlight" size="19px" color="currentColor" />
          </IconTile>
          <div style={adminRowTextStyle}>
            <Checkbox
              data-testid="admin-update-nightly-toggle"
              checked={enabled}
              onChange={(event) => void handleToggle(event.target.checked)}
              label={<Text variant="label" textId="admin.update.nightlyToggle" />}
            />
            <div style={nightlyTextStyle}>
              <Text variant="status" textId="admin.update.nightlyHelp" />
            </div>
          </div>
        </div>
      </div>
      {saveFailed && (
        <div style={adminNoticeStyle}>
          <Text variant="error" textId="admin.saveFailed" />
        </div>
      )}
    </>
  );
};
