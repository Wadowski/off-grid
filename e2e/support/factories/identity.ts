// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";

export const STRONG_PASSWORD = "correct horse battery staple";

export type RegistrationResult = {
  status: number;
  body: unknown;
  setCookie: string | undefined;
};

export function uniqueEmail(prefix = "person"): string {
  return `${prefix}-${randomUUID().slice(0, 8)}@example.com`;
}

const MAX_REGISTRATION_ATTEMPTS = 3;

export async function registerAccount(
  api: APIRequestContext,
  input: { email: string; displayName?: string; password?: string },
): Promise<RegistrationResult> {
  let registration = await postRegistration(api, input);
  for (
    let attempt = 1;
    attempt < MAX_REGISTRATION_ATTEMPTS && isFirstAdminRace(registration);
    attempt++
  ) {
    registration = await postRegistration(api, input);
  }
  return registration;
}

async function postRegistration(
  api: APIRequestContext,
  input: { email: string; displayName?: string; password?: string },
): Promise<RegistrationResult> {
  const response = await api.post("/api/auth/register", {
    data: {
      displayName: input.displayName ?? "Test Person",
      email: input.email,
      password: input.password ?? STRONG_PASSWORD,
    },
    failOnStatusCode: false,
  });
  return {
    status: response.status(),
    body: await response.json(),
    setCookie: response.headers()["set-cookie"],
  };
}

function isFirstAdminRace(registration: RegistrationResult): boolean {
  return (
    registration.status === 409 &&
    (registration.body as { code?: unknown }).code === "REGISTRATION_CONFLICT"
  );
}

export async function registrationStatus(api: APIRequestContext): Promise<unknown> {
  const response = await api.get("/api/auth/registration-status");
  return response.json();
}
