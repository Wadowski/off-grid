// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { useState } from "react";
import { webAdminClient } from "../../../../api/web-api-client.js";
import { adminSectionStyle } from "../../styles.js";
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
    <section style={adminSectionStyle}>
      <Text variant="subheading" textId="admin.registrationHeading" />
      <Checkbox
        data-testid="admin-registration-toggle"
        checked={registrationOpen}
        onChange={(event) => void handleToggle(event.target.checked)}
        label={<Text variant="label" textId="admin.registrationToggle" />}
      />
      <Text variant="caption" textId="admin.registrationHelp" />
      {saveFailed && <Text variant="error" textId="admin.saveFailed" />}
    </section>
  );
};
