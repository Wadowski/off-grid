// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { eventually } from "../eventually.js";
import type { JsonResponse, Session } from "./instance-admin.js";
import type { Drive } from "./types.js";

const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

export const getAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
): Promise<JsonResponse> => {
  const response = await api.get(path, { headers: bearer(session), failOnStatusCode: false });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const listDrivesAs = async (api: APIRequestContext, session: Session): Promise<Drive[]> => {
  const response = await getAs(api, session, "/api/drives");
  if (response.status !== 200) {
    throw new Error(`Drives could not be listed (${response.status}).`);
  }
  return (response.body as { drives: Drive[] }).drives;
};

export const waitForDrives = (
  api: APIRequestContext,
  session: Session,
  isReady: (drives: Drive[]) => boolean,
): Promise<Drive[]> =>
  eventually(
    async () => {
      const drives = await listDrivesAs(api, session);
      if (!isReady(drives)) {
        throw new Error("The expected drives are not listed yet.");
      }
      return drives;
    },
    { timeout: 10_000, interval: 200 },
  );

export const createFamilyAs = async (
  api: APIRequestContext,
  session: Session,
  name: string,
): Promise<{ id: string; name: string }> => {
  const response = await api.post("/api/families", {
    headers: bearer(session),
    data: { name },
    failOnStatusCode: false,
  });
  if (response.status() !== 201) {
    throw new Error(`The family could not be created (${response.status()}).`);
  }
  return (await response.json()) as { id: string; name: string };
};

export const familyNamesAs = async (
  api: APIRequestContext,
  session: Session,
): Promise<string[]> => {
  const response = await getAs(api, session, "/api/families");
  return ((response.body as { families: { name: string }[] }).families ?? []).map(
    (family) => family.name,
  );
};
