// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { eventually } from "./eventually.js";

const MAIL_CATCHER_BASE_URL = `http://127.0.0.1:${process.env.OFFGRID_MAIL_UI_PORT ?? "8025"}`;
const TEST_MAIL_SUBJECT = "Offgrid test email";
const RECOVERY_CODE_PATTERN = /reset code is (\d+)/;
const MAIL_TIMEOUT_MS = 15_000;
const MAIL_POLL_INTERVAL_MS = 250;

type MailSummary = {
  readonly ID: string;
  readonly Subject: string;
  readonly To: readonly { readonly Address: string }[];
};
type MailDetail = { readonly Text: string };

const getMailJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${MAIL_CATCHER_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`The mail catcher answered ${response.status}`);
  }
  return (await response.json()) as T;
};

const findRecoveryCodeInMail = async (email: string): Promise<string> => {
  const { messages } = await getMailJson<{ messages: MailSummary[] }>("/api/v1/messages");
  const message = messages.find((candidate) =>
    candidate.To.some((recipient) => recipient.Address === email),
  );
  if (message === undefined) {
    throw new Error(`No mail for ${email} yet`);
  }
  const detail = await getMailJson<MailDetail>(`/api/v1/message/${message.ID}`);
  const code = RECOVERY_CODE_PATTERN.exec(detail.Text)?.[1];
  if (code === undefined) {
    throw new Error("The mail does not contain a reset code");
  }
  return code;
};

export const recoveryCodeMailedTo = (email: string): Promise<string> =>
  eventually(() => findRecoveryCodeInMail(email), {
    timeout: MAIL_TIMEOUT_MS,
    interval: MAIL_POLL_INTERVAL_MS,
  });

const findTestMailTo = async (email: string): Promise<void> => {
  const { messages } = await getMailJson<{ messages: MailSummary[] }>("/api/v1/messages");
  const found = messages.some(
    (candidate) =>
      candidate.Subject === TEST_MAIL_SUBJECT &&
      candidate.To.some((recipient) => recipient.Address === email),
  );
  if (!found) {
    throw new Error(`No test mail for ${email} yet`);
  }
};

export const testMailArrivedFor = (email: string): Promise<void> =>
  eventually(() => findTestMailTo(email), {
    timeout: MAIL_TIMEOUT_MS,
    interval: MAIL_POLL_INTERVAL_MS,
  });
