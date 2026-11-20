// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { adminNoticeStyle } from "../../../../styles.js";
import { formatUpdateTime } from "../../format-update-time.js";
import { toUpdateStepTextId } from "../update-progress/update-progress-step-text-id.js";
import { updateResultStyle } from "./styles.js";
import type { UpdateResultProps } from "./types.js";
import { toUpdateResultTextId } from "./update-result-text-id.js";

export const UpdateResult = ({ update }: UpdateResultProps) => {
  const run = update.lastRun;
  if (run === null) {
    return (
      <div style={adminNoticeStyle}>
        <Text variant="status" textId="admin.update.never" />
      </div>
    );
  }
  const resultTextId = toUpdateResultTextId(update);
  if (resultTextId === null) {
    return null;
  }
  const isError = resultTextId !== "admin.update.succeeded";
  const failedStep = run.failedStep;
  return (
    <div style={adminNoticeStyle} data-testid="admin-update-result">
      <div style={updateResultStyle}>
        <Text variant="caption" textId="admin.update.lastResult" />
        <Text variant="status" value={formatUpdateTime(run.finishedAt ?? run.startedAt)} />
        <Text
          variant={isError ? "error" : "body"}
          textId={resultTextId}
          values={{ version: run.targetVersion }}
        />
        {isError && failedStep !== null && (
          <Text variant="status" textId="admin.update.failedStepLabel" />
        )}
        {isError && failedStep !== null && (
          <Text variant="body" textId={toUpdateStepTextId(failedStep)} />
        )}
        {isError && <Text variant="status" value={run.message} />}
        {run.writesAfterBackupLost && <Text variant="error" textId="admin.update.writesLost" />}
      </div>
    </div>
  );
};
