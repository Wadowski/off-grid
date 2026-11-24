// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FloatingPanel } from "@offgrid/ui";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { UploadQueueList } from "../../../../uploads/components/upload-queue-list/upload-queue-list.js";
import { UploadQueueLiveRegion } from "../../../../uploads/components/upload-queue-live-region/upload-queue-live-region.js";
import { isActiveUploadItem, useUploadQueueContext } from "../../../../uploads/index.js";
import { UploadQueuePanelHeader } from "./components/upload-queue-panel-header/upload-queue-panel-header.js";
import { isFilesPath } from "./is-files-path.js";
import { uploadQueuePanelListStyle } from "./styles.js";
import { toPanelSummary } from "./to-panel-summary.js";

const PANEL_LIST_ID = "upload-queue-panel-list";

type ExpandChoice = { readonly key: string; readonly expanded: boolean };

export const UploadQueuePanel = () => {
  const queue = useUploadQueueContext();
  const { pathname } = useLocation();
  const isNarrow = useIsNarrow();
  const onFilesPage = isFilesPath(pathname);
  const newestId = queue.items.at(-1)?.id ?? null;
  const [choice, setChoice] = useState<ExpandChoice | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const choiceKey = `${newestId ?? ""}:${onFilesPage ? "files" : "other"}`;
  const expanded = choice?.key === choiceKey ? choice.expanded : !onFilesPage;
  const setExpanded = (next: boolean) => setChoice({ key: choiceKey, expanded: next });
  const activeCount = queue.items.filter(isActiveUploadItem).length;

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
            activeCount={activeCount}
            expanded={expanded}
            sheet={isNarrow}
            controlsId={PANEL_LIST_ID}
            isIdle={queue.isIdle}
            toggleRef={toggleRef}
            onToggle={() => setExpanded(!expanded)}
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
