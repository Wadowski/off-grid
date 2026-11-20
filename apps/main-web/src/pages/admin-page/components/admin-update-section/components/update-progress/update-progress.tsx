// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { adminNoticeStyle } from "../../../../styles.js";
import { updateProgressStyle } from "./styles.js";
import type { UpdateProgressProps } from "./types.js";
import { toUpdateStepTextId } from "./update-progress-step-text-id.js";

export const UpdateProgress = ({ targetVersion, stepName, unreachable }: UpdateProgressProps) => (
  <div
    style={adminNoticeStyle}
    role="status"
    aria-live="polite"
    data-testid="admin-update-progress"
  >
    <div style={updateProgressStyle}>
      <Text
        variant="status"
        textId="admin.update.progressTitle"
        values={{ version: targetVersion }}
      />
      {unreachable ? (
        <Text variant="status" textId="admin.update.restarting" />
      ) : (
        stepName !== null && <Text variant="body" textId={toUpdateStepTextId(stepName)} />
      )}
    </div>
  </div>
);
