// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import type { ParseKeys } from "i18next";
import type { FormEvent } from "react";
import { useState } from "react";
import { webAuthClient } from "../../api/web-api-client.js";
import { DISPLAY_NAME_MAX_LENGTH } from "../../constants.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../../forms/shared/styles.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { loadProfile } from "../../session/load-profile.js";
import { useSession } from "../../session/use-session.js";

export const SettingsProfilePage = () => {
  const session = useSession();
  const currentName = session.status === "signedIn" ? session.user.displayName : "";
  const [name, setName] = useState(currentName);
  const [nameError, setNameError] = useState<ParseKeys>();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  if (session.status !== "signedIn") {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const displayName = name.trim();
    if (displayName.length === 0) {
      setNameError("settings.nameRequired");
      return;
    }
    if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      setNameError("settings.nameTooLong");
      return;
    }
    setNameError(undefined);
    setStatus("saving");
    try {
      await webAuthClient.updateProfile({ displayName });
      await loadProfile();
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <SettingsSubpage titleTextId="settings.profileLabel">
      <form
        data-testid="settings-profile-form"
        onSubmit={handleSubmit}
        noValidate
        style={formStyle}
      >
        <TextField
          data-testid="settings-profile-name"
          name="displayName"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          label={<Text variant="label" textId="settings.nameLabel" />}
          error={nameError === undefined ? undefined : <Text variant="error" textId={nameError} />}
        />
        <div style={actionBlockStyle}>
          <Button type="submit" data-testid="settings-profile-save" disabled={status === "saving"}>
            <Text
              variant="action"
              textId={status === "saving" ? "settings.saving" : "settings.save"}
            />
          </Button>
          <div role="status" style={errorBannerStyle}>
            {status === "saved" && <Text variant="status" textId="settings.saved" />}
            {status === "failed" && <Text variant="error" textId="settings.failed" />}
          </div>
        </div>
      </form>
    </SettingsSubpage>
  );
};
