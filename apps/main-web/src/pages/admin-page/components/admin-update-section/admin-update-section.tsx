// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Text } from "@offgrid/ui";
import { useState } from "react";
import { webSystemClient } from "../../../../api/web-api-client.js";
import {
  sectionCardStyle,
  sectionHeaderStyle,
  sectionStyle,
} from "../../../settings-page/components/settings-section/styles.js";
import { adminNoticeStyle } from "../../styles.js";
import { UpdateActionsRow } from "./components/update-actions-row/update-actions-row.js";
import { UpdateAvailabilityNote } from "./components/update-availability-note/update-availability-note.js";
import { UpdateConfirmDialog } from "./components/update-confirm-dialog/update-confirm-dialog.js";
import { UpdateNightlyToggle } from "./components/update-nightly-toggle/update-nightly-toggle.js";
import { UpdateProgress } from "./components/update-progress/update-progress.js";
import { UpdateResult } from "./components/update-result/update-result.js";
import { UpdateVersionsRow } from "./components/update-versions-row/update-versions-row.js";
import { describeUpdateError } from "./describe-update-error.js";
import { findRunningStep } from "./find-running-step.js";
import { useUpdateStatus } from "./use-update-status.js";
import type { UpdateErrorTextId } from "./types.js";

export const AdminUpdateSection = () => {
  const { state, reload, markRunning } = useUpdateStatus();
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyErrorTextId, setApplyErrorTextId] = useState<UpdateErrorTextId>();

  if (state.status === "loading") {
    return null;
  }
  if (state.status === "failed") {
    return (
      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Text variant="caption" textId="admin.update.heading" />
        </div>
        <div style={sectionCardStyle}>
          <div style={adminNoticeStyle}>
            <Text variant="error" textId="admin.update.loadFailed" />
          </div>
        </div>
      </section>
    );
  }

  const { update, unreachable } = state;
  const running = update.running;
  const targetVersion = update.latestVersion;
  const canCheck = !checking && !running;
  const canUpdate =
    update.updateAvailable &&
    update.updateAllowed &&
    !running &&
    !applying &&
    targetVersion !== null;

  const handleCheck = async () => {
    setCheckFailed(false);
    setChecking(true);
    try {
      await webSystemClient.checkForUpdate();
      await reload();
    } catch {
      setCheckFailed(true);
    } finally {
      setChecking(false);
    }
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setApplyErrorTextId(undefined);
    setApplying(true);
    try {
      await webSystemClient.applyUpdate();
      markRunning();
    } catch (error) {
      setApplyErrorTextId(describeUpdateError(error));
      if (error instanceof ApiError && error.code === "UPDATE_ALREADY_RUNNING") {
        await reload();
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <Text variant="caption" textId="admin.update.heading" />
      </div>
      <div style={sectionCardStyle}>
        <UpdateVersionsRow
          isFirst
          currentVersion={update.currentVersion}
          latestVersion={update.latestVersion}
          checkedAt={update.checkedAt}
        />
        <UpdateAvailabilityNote update={update} />
        <UpdateActionsRow
          isFirst={false}
          checking={checking}
          canCheck={canCheck}
          canUpdate={canUpdate}
          onCheck={() => void handleCheck()}
          onUpdate={() => setConfirmOpen(true)}
        />
        {running && (
          <UpdateProgress
            targetVersion={update.lastRun?.targetVersion ?? targetVersion ?? update.currentVersion}
            stepName={findRunningStep(update)}
            unreachable={unreachable}
          />
        )}
        {!running && <UpdateResult update={update} />}
        {checkFailed && (
          <div style={adminNoticeStyle}>
            <Text variant="error" textId="admin.update.checkFailed" />
          </div>
        )}
        {applyErrorTextId !== undefined && (
          <div style={adminNoticeStyle}>
            <Text variant="error" textId={applyErrorTextId} />
          </div>
        )}
        <UpdateNightlyToggle nightlyEnabled={update.nightlyEnabled} />
      </div>
      {confirmOpen && targetVersion !== null && (
        <UpdateConfirmDialog
          version={targetVersion}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleConfirm()}
        />
      )}
    </section>
  );
};
