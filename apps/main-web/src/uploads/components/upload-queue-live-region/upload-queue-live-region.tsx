// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, VisuallyHidden } from "@offgrid/ui";
import type { UploadQueueLiveRegionProps } from "./types.js";

export const UploadQueueLiveRegion = ({ announcement }: UploadQueueLiveRegionProps) => (
  <div role="status" aria-live="polite" data-testid="upload-announcer">
    {announcement === null ? null : (
      <VisuallyHidden key={announcement.sequence}>
        <Text variant="caption" textId={announcement.textId} values={{ name: announcement.name }} />
        {announcement.reasonTextId === null ? null : (
          <Text variant="caption" textId={announcement.reasonTextId} />
        )}
      </VisuallyHidden>
    )}
  </div>
);
