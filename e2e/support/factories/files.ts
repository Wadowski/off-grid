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

export const postAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
  data: unknown,
): Promise<JsonResponse> => {
  const response = await api.post(path, { headers: bearer(session), data, failOnStatusCode: false });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const patchAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
  data: unknown,
): Promise<JsonResponse> => {
  const response = await api.patch(path, { headers: bearer(session), data, failOnStatusCode: false });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export type FileItem = { id: string; name: string; isFolder: boolean; parentId: string | null };

export const listItemsAs = async (
  api: APIRequestContext,
  session: Session,
  container: { kind: "drive" | "folder"; id: string },
): Promise<FileItem[]> => {
  const path =
    container.kind === "drive"
      ? `/api/drives/${container.id}/children`
      : `/api/files/${container.id}/children`;
  const response = await getAs(api, session, path);
  if (response.status !== 200) {
    throw new Error(`The entries could not be listed (${response.status}).`);
  }
  return (response.body as { items: FileItem[] }).items;
};

export const joinFamilyAs = async (
  api: APIRequestContext,
  owner: Session,
  familyId: string,
  joiner: Session,
): Promise<void> => {
  const invitation = await postAs(api, owner, `/api/families/${familyId}/invitations`, undefined);
  if (invitation.status !== 201) {
    throw new Error(`The invitation could not be created (${invitation.status}).`);
  }
  const { code } = invitation.body as { code: string };
  const joined = await postAs(api, joiner, "/api/families/join", { code });
  if (joined.status !== 200 && joined.status !== 201) {
    throw new Error(`The family could not be joined (${joined.status}).`);
  }
};

export const findFolderAcrossDrives = async (
  api: APIRequestContext,
  session: Session,
  drives: Drive[],
  name: string,
): Promise<string> => {
  const queue: Array<{ kind: "drive" | "folder"; id: string }> = drives.map((drive) => ({
    kind: "drive",
    id: drive.id,
  }));
  while (queue.length > 0) {
    const container = queue.shift();
    if (container === undefined) {
      break;
    }
    const items = await listItemsAs(api, session, container);
    const match = items.find((item) => item.isFolder && item.name === name);
    if (match !== undefined) {
      return match.id;
    }
    queue.push(...items.filter((item) => item.isFolder).map((item) => ({ kind: "folder" as const, id: item.id })));
  }
  throw new Error(`The folder ${name} is not in any drive`);
};
