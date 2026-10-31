// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { FamilyListItem } from "./components/family-list-item/family-list-item.js";
import { FamilyListMessage } from "./components/family-list-message/family-list-message.js";
import { familyListMessageContent } from "./components/family-list-message/family-list-message-content.js";
import { familyListStyle } from "./styles.js";
import type { FamilyListProps } from "./types.js";

export const FamilyList = ({ families, listStatus }: FamilyListProps) => {
  const message = familyListMessageContent(families, listStatus);

  if (message !== undefined) {
    return <FamilyListMessage {...message} />;
  }

  return (
    <section aria-labelledby="family-list-heading">
      <Text variant="subheading" id="family-list-heading" textId="families.listHeading" />
      <ul data-testid="family-list" style={familyListStyle}>
        {families.map((family) => (
          <FamilyListItem key={family.id} family={family} />
        ))}
      </ul>
    </section>
  );
};
