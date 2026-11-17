// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { versionRowStyle } from "./styles.js";
import { useRunningVersion } from "./use-running-version.js";

export const SettingsVersionRow = () => {
  const runningVersion = useRunningVersion();

  if (runningVersion.status === "loading") {
    return null;
  }

  return (
    <div style={versionRowStyle} data-testid="settings-version">
      {runningVersion.status === "ready" ? (
        <Text
          variant="caption"
          textId="settings.versionLabel"
          values={{ version: runningVersion.version }}
        />
      ) : (
        <Text variant="caption" textId="settings.versionUnavailable" />
      )}
    </div>
  );
};
