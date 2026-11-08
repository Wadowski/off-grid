// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Radio, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { webAdminClient } from "../../api/web-api-client.js";
import { formStyle, actionBlockStyle, errorBannerStyle } from "../../forms/shared/styles.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { useSession } from "../../session/use-session.js";
import { buildMailRequest } from "./build-mail-request.js";
import { MAIL_PROVIDER_OPTIONS, MAIL_SECURITY_OPTIONS, testFailureTextIdOf } from "./constants.js";
import { adminEmailStatusStyle } from "./styles.js";
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
    return <Text variant="body" textId="admin.noAccess" />;
  }
  return <AdminEmailForm />;
};

const AdminEmailForm = () => {
  const [form, setForm] = useState<MailFormState>(INITIAL_FORM);
  const [configured, setConfigured] = useState<boolean>();
  const [testResult, setTestResult] = useState<TestResult>("idle");
  const [failureCode, setFailureCode] = useState<string>();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void webAdminClient.mailSettings().then((settings) => setConfigured(settings.configured));
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
    const settings = await webAdminClient.saveMailSettings(buildMailRequest(form));
    setConfigured(settings.configured);
    setForm((current) => ({ ...current, password: "" }));
    setSaved(true);
  };

  const isOther = form.provider === "other";

  return (
    <SettingsSubpage titleTextId="admin.emailHeading">
      <div style={adminEmailStatusStyle}>
        <Text variant="status" textId={configured ? "admin.emailWorking" : "admin.emailNotSetUp"} />
      </div>
      <form data-testid="admin-email-form" onSubmit={handleSave} noValidate style={formStyle}>
        <fieldset>
          <legend>
            <Text variant="label" textId="admin.emailProviderLabel" />
          </legend>
          {MAIL_PROVIDER_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="provider"
              value={option.value}
              checked={form.provider === option.value}
              onChange={() => updateField("provider", option.value)}
              label={<Text variant="label" textId={option.labelTextId} />}
            />
          ))}
        </fieldset>
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
        {isOther && (
          <>
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
            <fieldset>
              <legend>
                <Text variant="label" textId="admin.smtpSecurityLabel" />
              </legend>
              {MAIL_SECURITY_OPTIONS.map((option) => (
                <Radio
                  key={option.value}
                  name="smtpSecurity"
                  value={option.value}
                  checked={form.smtpSecurity === option.value}
                  onChange={() => updateField("smtpSecurity", option.value)}
                  label={<Text variant="label" textId={option.labelTextId} />}
                />
              ))}
            </fieldset>
          </>
        )}
        <div style={actionBlockStyle}>
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
          <div role="status" style={errorBannerStyle}>
            {testResult === "sent" && <Text variant="status" textId="admin.testEmailSent" />}
            {testResult === "failed" && (
              <Text variant="error" textId={testFailureTextIdOf(failureCode)} />
            )}
            {saved && <Text variant="status" textId="admin.mailSaved" />}
          </div>
        </div>
      </form>
      <Text variant="caption" textId="admin.appPasswordHelp" />
    </SettingsSubpage>
  );
};
