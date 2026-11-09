// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { webAdminClient } from "../../api/web-api-client.js";
import { actionRowStyle, errorBannerStyle } from "../../forms/shared/styles.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { useSession } from "../../session/use-session.js";
import {
  profileCardStyle,
  profileTextStyle,
} from "../settings-page/components/settings-profile-card/styles.js";
import { iconTileStyle } from "../settings-page/components/settings-link-row/styles.js";
import {
  sectionCardStyle,
  sectionHeaderStyle,
  sectionStyle,
} from "../settings-page/components/settings-section/styles.js";
import { adminFieldsStyle, adminNoticeStyle, adminRowStyle } from "../admin-page/styles.js";
import { AdminRadioGroup } from "./components/admin-radio-group/admin-radio-group.js";
import { buildMailRequest } from "./build-mail-request.js";
import { MAIL_PROVIDER_OPTIONS, MAIL_SECURITY_OPTIONS, testFailureTextIdOf } from "./constants.js";
import type { MailFormState } from "./types.js";

const INITIAL_FORM: MailFormState = {
  provider: "gmail",
  email: "",
  password: "",
  smtpHost: "",
  smtpPort: "",
  smtpSecurity: "starttls",
};

type TestResult = "idle" | "sending" | "sent" | "failed";

export const AdminEmailPage = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return null;
  }
  if (session.user.instanceRole !== "admin") {
    return (
      <SettingsSubpage titleTextId="admin.emailHeading">
        <Text variant="body" textId="admin.noAccess" />
      </SettingsSubpage>
    );
  }
  return <AdminEmailForm />;
};

const AdminEmailForm = () => {
  const [form, setForm] = useState<MailFormState>(INITIAL_FORM);
  const [configured, setConfigured] = useState<boolean>();
  const [testResult, setTestResult] = useState<TestResult>("idle");
  const [failureCode, setFailureCode] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    webAdminClient
      .mailSettings()
      .then((settings) => setConfigured(settings.configured))
      .catch(() => setLoadFailed(true));
  }, []);

  const updateField = <Field extends keyof MailFormState>(
    field: Field,
    value: MailFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const sendTest = async () => {
    setTestResult("sending");
    try {
      await webAdminClient.sendTestMail(buildMailRequest(form));
      setTestResult("sent");
    } catch (error) {
      setFailureCode(error instanceof ApiError ? error.code : undefined);
      setTestResult("failed");
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveFailed(false);
    try {
      const settings = await webAdminClient.saveMailSettings(buildMailRequest(form));
      setConfigured(settings.configured);
      setForm((current) => ({ ...current, password: "" }));
      setSaved(true);
    } catch {
      setSaveFailed(true);
    }
  };

  const isOther = form.provider === "other";

  return (
    <SettingsSubpage titleTextId="admin.emailHeading">
      <div style={profileCardStyle}>
        <span style={iconTileStyle(configured ? "good" : "soft")} aria-hidden="true">
          <MaterialIcon name="mail" size="19px" color="currentColor" />
        </span>
        <div style={profileTextStyle}>
          <Text
            variant="label"
            textId={configured ? "admin.emailWorking" : "admin.emailNotSetUp"}
          />
          <Text variant="status" textId="admin.emailDescription" />
        </div>
      </div>
      {loadFailed && <Text variant="error" textId="admin.loadFailed" />}
      <form data-testid="admin-email-form" onSubmit={handleSave} noValidate style={sectionStyle}>
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Text variant="caption" textId="admin.emailProviderLabel" />
          </div>
          <div style={sectionCardStyle}>
            <AdminRadioGroup
              name="provider"
              legendTextId="admin.emailProviderLabel"
              options={MAIL_PROVIDER_OPTIONS}
              value={form.provider}
              onChange={(provider) => updateField("provider", provider)}
            />
          </div>
        </section>
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Text variant="caption" textId="admin.emailAccountSection" />
          </div>
          <div style={sectionCardStyle}>
            <div style={adminFieldsStyle}>
              <TextField
                data-testid="admin-email-address"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                label={<Text variant="label" textId="admin.emailAddressLabel" />}
              />
              <TextField
                data-testid="admin-email-app-password"
                name="password"
                type="password"
                autoComplete="off"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                label={<Text variant="label" textId="admin.appPasswordLabel" />}
              />
            </div>
          </div>
        </section>
        {isOther && (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Text variant="caption" textId="admin.serverSection" />
            </div>
            <div style={sectionCardStyle}>
              <div style={adminFieldsStyle}>
                <TextField
                  data-testid="admin-email-host"
                  name="smtpHost"
                  value={form.smtpHost}
                  onChange={(event) => updateField("smtpHost", event.target.value)}
                  label={<Text variant="label" textId="admin.smtpHostLabel" />}
                />
                <TextField
                  data-testid="admin-email-port"
                  name="smtpPort"
                  inputMode="numeric"
                  value={form.smtpPort}
                  onChange={(event) => updateField("smtpPort", event.target.value)}
                  label={<Text variant="label" textId="admin.smtpPortLabel" />}
                />
              </div>
              <AdminRadioGroup
                name="smtpSecurity"
                legendTextId="admin.smtpSecurityLabel"
                options={MAIL_SECURITY_OPTIONS}
                value={form.smtpSecurity}
                onChange={(security) => updateField("smtpSecurity", security)}
              />
            </div>
          </section>
        )}
        <section style={sectionStyle}>
          <div style={sectionCardStyle}>
            <div style={adminRowStyle(true)}>
              <div style={actionRowStyle}>
                <Button
                  type="button"
                  variant="secondary"
                  data-testid="admin-email-send-test"
                  disabled={testResult === "sending"}
                  onClick={() => void sendTest()}
                >
                  <Text variant="action" textId="admin.sendTestEmail" />
                </Button>
                <Button type="submit" data-testid="admin-email-save">
                  <Text variant="action" textId="admin.saveMailSettings" />
                </Button>
              </div>
            </div>
            <div role="status" style={{ ...errorBannerStyle, ...adminNoticeStyle }}>
              {testResult === "sent" && <Text variant="status" textId="admin.testEmailSent" />}
              {testResult === "failed" && (
                <Text variant="error" textId={testFailureTextIdOf(failureCode)} />
              )}
              {saved && <Text variant="status" textId="admin.mailSaved" />}
              {saveFailed && <Text variant="error" textId="admin.saveFailed" />}
            </div>
            <div style={adminNoticeStyle}>
              <Text variant="caption" textId="admin.appPasswordHelp" />
            </div>
          </div>
        </section>
      </form>
    </SettingsSubpage>
  );
};
