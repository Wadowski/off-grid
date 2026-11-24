// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FloatingPanel } from "@offgrid/ui";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { UploadQueueList } from "../../../../uploads/components/upload-queue-list/upload-queue-list.js";
import { UploadQueueLiveRegion } from "../../../../uploads/components/upload-queue-live-region/upload-queue-live-region.js";
import { useUploadQueueContext } from "../../../../uploads/index.js";
import { UploadQueuePanelHeader } from "./components/upload-queue-panel-header/upload-queue-panel-header.js";
import { isFilesPath } from "./is-files-path.js";
import { uploadQueuePanelListStyle } from "./styles.js";
import { toPanelSummary } from "./to-panel-summary.js";

const PANEL_LIST_ID = "upload-queue-panel-list";

export const UploadQueuePanel = () => {
  const queue = useUploadQueueContext();
  const { pathname } = useLocation();
  const isNarrow = useIsNarrow();
  const onFilesPage = isFilesPath(pathname);
  const newestId = queue.items.at(-1)?.id ?? null;
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (newestId !== null && newestId !== openedFor) {
      setOpenedFor(newestId);
      setExpanded(!onFilesPage);
    }
  }, [newestId, openedFor, onFilesPage]);

  useEffect(() => {
    if (!onFilesPage) {
      setExpanded(true);
    }
  }, [onFilesPage]);

  const collapse = () => {
    setExpanded(false);
    toggleRef.current?.focus();
  };

  const placement = isNarrow ? "sheet" : "corner";
  const shape = expanded ? "card" : "pill";
  const tone = isNarrow && !expanded ? "inverse" : "surface";

  return (
    <>
      <UploadQueueLiveRegion announcement={queue.announcement} />
      {queue.items.length === 0 ? null : (
        <FloatingPanel
          placement={placement}
          shape={shape}
          tone={tone}
          labelledBy="upload-queue-panel-title"
          onEscape={() => {
            if (expanded) {
              collapse();
            }
          }}
          testId="upload-queue-panel"
        >
          <UploadQueuePanelHeader
            summary={toPanelSummary(queue.items)}
            expanded={expanded}
            controlsId={PANEL_LIST_ID}
            isIdle={queue.isIdle}
            toggleRef={toggleRef}
            onToggle={() => setExpanded((current) => !current)}
            onClose={queue.clearFinished}
          />
          {expanded ? (
            <div id={PANEL_LIST_ID} style={uploadQueuePanelListStyle}>
              <UploadQueueList
                items={queue.items}
                testIdPrefix="upload-queue-panel"
                alertOnFailure={false}
                isIdle={queue.isIdle}
                onClearFinished={queue.clearFinished}
              />
            </div>
          ) : null}
        </FloatingPanel>
      )}
    </>
  );
};
