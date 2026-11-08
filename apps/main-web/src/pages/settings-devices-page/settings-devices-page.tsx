// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useEffect, useState } from "react";
import { webAuthClient } from "../../api/web-api-client.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import {
  settingsDeviceListStyle,
  settingsDeviceRowStyle,
  settingsDevicesActionsStyle,
} from "./styles.js";
import type { DeviceListStatus, DeviceSession } from "./types.js";

export const SettingsDevicesPage = () => {
  const [sessions, setSessions] = useState<readonly DeviceSession[]>([]);
  const [listStatus, setListStatus] = useState<DeviceListStatus>("loading");
  const [confirmingSignOutOthers, setConfirmingSignOutOthers] = useState(false);
  const otherSessions = sessions.filter((session) => !session.current);

  const loadSessions = async () => {
    try {
      const list = await webAuthClient.sessions();
      setSessions(list.sessions);
      setListStatus("ready");
    } catch {
      setListStatus("failed");
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const endSession = async (sessionId: string) => {
    await webAuthClient.endSession(sessionId);
    await loadSessions();
  };

  const signOutOthers = async () => {
    await webAuthClient.signOutOtherSessions();
    setConfirmingSignOutOthers(false);
    await loadSessions();
  };

  return (
    <SettingsSubpage titleTextId="settings.devicesLabel">
      {listStatus === "loading" && <Text variant="status" textId="settings.devicesLoading" />}
      {listStatus === "failed" && <Text variant="error" textId="settings.devicesFailed" />}
      {listStatus === "ready" && (
        <ul style={settingsDeviceListStyle} data-testid="settings-device-list">
          {sessions.map((session) => (
            <li key={session.id} style={settingsDeviceRowStyle}>
              <div>
                {session.deviceLabel === null ? (
                  <Text variant="label" textId="settings.unnamedDevice" />
                ) : (
                  <Text variant="label" value={session.deviceLabel} />
                )}
                <Text variant="status" value={new Date(session.lastUsedAt).toLocaleString()} />
              </div>
              {session.current ? (
                <Text variant="status" textId="settings.thisDevice" />
              ) : (
                <Button variant="secondary" onClick={() => void endSession(session.id)}>
                  <Text variant="action" textId="settings.endSession" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {listStatus === "ready" && otherSessions.length === 0 && (
        <Text variant="status" textId="settings.devicesEmpty" />
      )}
      {listStatus === "ready" && otherSessions.length > 0 && (
        <div style={settingsDevicesActionsStyle}>
          {confirmingSignOutOthers ? (
            <>
              <Text variant="body" textId="settings.signOutOthersConfirm" />
              <Button variant="primary" onClick={() => void signOutOthers()}>
                <Text variant="action" textId="settings.confirmSignOutOthers" />
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingSignOutOthers(false)}>
                <Text variant="action" textId="settings.cancel" />
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmingSignOutOthers(true)}>
              <Text variant="action" textId="settings.signOutOthers" />
            </Button>
          )}
        </div>
      )}
    </SettingsSubpage>
  );
};
