// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Card, Text } from "@offgrid/ui";
import { AccessRow } from "./components/access-row/access-row.js";
import { accessListStyle, accessSectionStyle, accessStatusStyle } from "./styles.js";
import type { FileAccessListProps } from "./types.js";

export const FileAccessList = ({
  status,
  entries,
  familyDriveName,
  onRetry,
}: FileAccessListProps) => (
  <section style={accessSectionStyle} data-testid="file-access-list">
    <Text variant="label" textId="files.details.access.heading" />
    <Card>
      {status === "loading" ? <Text variant="body" textId="files.folder.loading" /> : null}
      {status === "failed" ? (
        <div role="alert" style={accessStatusStyle}>
          <Text variant="error" textId="files.details.access.failed" />
          <Button type="button" variant="secondary" onClick={() => void onRetry()}>
            <Text variant="action" textId="files.folder.retry" />
          </Button>
        </div>
      ) : null}
      {status === "ready" ? (
        <>
          {familyDriveName === null ? null : (
            <Text
              variant="caption"
              textId="files.details.access.familyDrive"
              values={{ name: familyDriveName, count: entries.length }}
            />
          )}
          <ul style={accessListStyle}>
            {entries.map((entry, index) => (
              <AccessRow
                key={entry.userId}
                name={entry.name}
                role={entry.role}
                isFirst={index === 0}
              />
            ))}
          </ul>
        </>
      ) : null}
    </Card>
  </section>
);
