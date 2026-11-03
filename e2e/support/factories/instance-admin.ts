// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./identity.js";
import { compose } from "../stack.js";

export const RUN_ADMIN_EMAIL = "run-admin@example.com";
export const RUN_ADMIN_NAME = "Run Admin";
export const NEW_PASSWORD = "a different long passphrase";

export type Session = { userId: string; accessToken: string };

export type Member = { userId: string; email: string; password: string };

export type JsonResponse = { status: number; body: unknown };

let runAdminSession: Session | undefined;

export async function signInWith(
  api: APIRequestContext,
  email: string,
  password: string,
): Promise<JsonResponse & { session?: Session }> {
  const response = await api.post("/api/auth/sign-in", {
    data: { email, password },
    failOnStatusCode: false,
  });
  const body = (await response.json()) as { user?: { id: string }; accessToken?: string };
  const session =
    response.status() === 200 && body.user !== undefined && body.accessToken !== undefined
      ? { userId: body.user.id, accessToken: body.accessToken }
      : undefined;
  return { status: response.status(), body, session };
}

export async function provisionRunAdmin(api: APIRequestContext): Promise<void> {
  const registration = await registerAccount(api, {
    email: RUN_ADMIN_EMAIL,
    displayName: RUN_ADMIN_NAME,
  });
  if (registration.status !== 201) {
    throw new Error(`Could not provision the run admin: ${JSON.stringify(registration.body)}`);
  }
}

export function forgetRunAdminSession(): void {
  runAdminSession = undefined;
}

export async function runRecoveryCommand(args: readonly string[]): Promise<string> {
  const project = process.env.E2E_COMPOSE_PROJECT;
  if (project === undefined) {
    throw new Error("The recovery command needs the compose stack that this run started.");
  }
  return compose(project, [
    "exec",
    "-T",
    "server",
    "node",
    "--import",
    "tsx",
    "src/recover-admin.ts",
    ...args,
  ]);
}

export function issuedCodeFrom(recoveryOutput: string): string {
  const match = /One-time reset code for the admin: (\S+)/.exec(recoveryOutput);
  if (match?.[1] === undefined) {
    throw new Error(`The recovery command printed no reset code: ${recoveryOutput}`);
  }
  return match[1];
}

export async function ensureRunAdmin(api: APIRequestContext): Promise<Session> {
  if (runAdminSession !== undefined) {
    return runAdminSession;
  }
  const first = await signInWith(api, RUN_ADMIN_EMAIL, STRONG_PASSWORD);
  if (first.session === undefined) {
    await registerAccount(api, { email: RUN_ADMIN_EMAIL, displayName: RUN_ADMIN_NAME });
  }
  const signedIn =
    first.session ?? (await signInWith(api, RUN_ADMIN_EMAIL, STRONG_PASSWORD)).session;
  if (signedIn === undefined) {
    throw new Error("The run admin cannot sign in; another account may have registered first.");
  }
  runAdminSession = signedIn;
  return signedIn;
}

export async function createMember(api: APIRequestContext, prefix = "member"): Promise<Member> {
  const email = uniqueEmail(prefix);
  const registration = await registerAccount(api, { email });
  if (registration.status !== 201) {
    throw new Error(`Could not create a member: ${JSON.stringify(registration.body)}`);
  }
  const body = registration.body as { user: { id: string } };
  return { userId: body.user.id, email, password: STRONG_PASSWORD };
}

export function listUsers(api: APIRequestContext, session: Session): Promise<APIResponse> {
  return api.get("/api/admin/users", { headers: authorization(session), failOnStatusCode: false });
}

export function setUserDisabled(
  api: APIRequestContext,
  session: Session,
  userId: string,
  disabled: boolean,
): Promise<APIResponse> {
  const action = disabled ? "disable" : "enable";
  return api.post(`/api/admin/users/${userId}/${action}`, {
    headers: authorization(session),
    failOnStatusCode: false,
  });
}

export function startPasswordResetFor(
  api: APIRequestContext,
  session: Session,
  userId: string,
): Promise<APIResponse> {
  return api.post(`/api/admin/users/${userId}/password-reset`, {
    headers: authorization(session),
    failOnStatusCode: false,
  });
}

export function completePasswordReset(
  api: APIRequestContext,
  code: string,
  password: string,
): Promise<APIResponse> {
  return api.post("/api/auth/password-reset", {
    data: { code, password },
    failOnStatusCode: false,
  });
}

export function setRegistrationOpen(
  api: APIRequestContext,
  session: Session,
  registrationOpen: boolean,
): Promise<APIResponse> {
  return api.patch("/api/admin/instance-settings", {
    headers: authorization(session),
    data: { registrationOpen },
    failOnStatusCode: false,
  });
}

export function accessWithToken(api: APIRequestContext, accessToken: string): Promise<APIResponse> {
  return api.get("/api/families", {
    headers: { authorization: `Bearer ${accessToken}` },
    failOnStatusCode: false,
  });
}

function authorization(session: Session): Record<string, string> {
  return { authorization: `Bearer ${session.accessToken}` };
}
