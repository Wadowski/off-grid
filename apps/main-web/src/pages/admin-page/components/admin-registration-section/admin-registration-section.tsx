// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { webAdminClient } from "../../../../api/web-api-client.js";
import { adminSectionStyle } from "../../styles.js";
import type { AdminRegistrationSectionProps } from "./types.js";

export const AdminRegistrationSection = ({
  registrationOpen,
  onChange,
}: AdminRegistrationSectionProps) => {
  const handleToggle = async (open: boolean) => {
    onChange(open);
    const saved = await webAdminClient.updateInstanceSettings({ registrationOpen: open });
    onChange(saved.registrationOpen);
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
    </section>
  );
};
