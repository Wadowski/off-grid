// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { SettingsLinkRow } from "../settings-link-row/settings-link-row.js";
import { sectionCardStyle, sectionHeaderStyle, sectionStyle } from "./styles.js";
import type { SettingsSectionProps } from "./types.js";

export const SettingsSection = ({ section }: SettingsSectionProps) => (
  <section style={sectionStyle}>
    <div style={sectionHeaderStyle}>
      <Text variant="caption" textId={section.labelTextId} />
    </div>
    <div style={sectionCardStyle}>
      {section.links.map((link, index) => (
        <SettingsLinkRow key={link.path} link={link} isFirst={index === 0} />
      ))}
    </div>
  </section>
);
