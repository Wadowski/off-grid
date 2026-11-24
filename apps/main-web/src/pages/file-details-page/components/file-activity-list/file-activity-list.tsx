// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Card, Text } from "@offgrid/ui";
import { ActivityRow } from "./components/activity-row/activity-row.js";
import { activityListStyle, activitySectionStyle, activityStatusStyle } from "./styles.js";
import type { FileActivityListProps } from "./types.js";

export const FileActivityList = ({ status, entries, onRetry }: FileActivityListProps) => {
  if (status === "failed") {
    return (
      <div role="alert" style={activityStatusStyle} data-testid="file-activity-list">
        <Text variant="error" textId="files.details.activity.failed" />
        <Button type="button" variant="secondary" onClick={() => void onRetry()}>
          <Text variant="action" textId="files.folder.retry" />
        </Button>
      </div>
    );
  }
  if (status === "loading") {
    return <Text variant="body" textId="files.folder.loading" />;
  }
  if (entries.length === 0) {
    return <Text variant="body" textId="files.details.activity.empty" />;
  }
  return (
    <section style={activitySectionStyle} data-testid="file-activity-list">
      <Card>
        <ul style={activityListStyle}>
          {entries.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </ul>
      </Card>
    </section>
  );
};
