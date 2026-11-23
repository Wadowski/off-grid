// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import type { ActivityTextProps } from "./types.js";

export const ActivityText = ({ entry }: ActivityTextProps) => {
  const isFirstVersion = entry.number === 1;
  if (entry.name === null) {
    return isFirstVersion ? (
      <Text variant="body" textId="files.details.activity.addedByFormerMember" />
    ) : (
      <Text
        variant="body"
        textId="files.details.activity.savedVersionByFormerMember"
        values={{ count: entry.number }}
      />
    );
  }
  return isFirstVersion ? (
    <Text variant="body" textId="files.details.activity.added" values={{ name: entry.name }} />
  ) : (
    <Text
      variant="body"
      textId="files.details.activity.savedVersion"
      values={{ name: entry.name, count: entry.number }}
    />
  );
};
