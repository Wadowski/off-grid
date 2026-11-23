// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { FILE_NAME_HEADER, PARENT_ID_HEADER } from "@offgrid/contracts";
import { eventually } from "../eventually.js";
import type { JsonResponse, Session } from "./instance-admin.js";
import type { Container, Drive, DownloadResponse, FileItem } from "./types.js";

const DEFAULT_E2E_UPLOAD_LIMIT_BYTES = 1024 * 1024;

export const E2E_UPLOAD_LIMIT_BYTES = Number(
  process.env.OFFGRID_FILES_MAX_UPLOAD_BYTES ?? DEFAULT_E2E_UPLOAD_LIMIT_BYTES,
);

export const oversizedUploadBody = (): string => "x".repeat(E2E_UPLOAD_LIMIT_BYTES + 1);

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
  const response = await api.post(path, {
    headers: bearer(session),
    data,
    failOnStatusCode: false,
  });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const patchAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
  data: unknown,
): Promise<JsonResponse> => {
  const response = await api.patch(path, {
    headers: bearer(session),
    data,
    failOnStatusCode: false,
  });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const personalDriveIdAs = async (
  api: APIRequestContext,
  session: Session,
): Promise<string> => {
  const drives = await waitForDrives(api, session, (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  const drive = drives.find((listed) => listed.familyId === null);
  if (drive === undefined) {
    throw new Error("The personal drive is not listed.");
  }
  return drive.id;
};

export const createFolderAs = async (
  api: APIRequestContext,
  session: Session,
  driveId: string,
  parentId: string | null,
  name: string,
): Promise<void> => {
  const response = await postAs(api, session, `/api/drives/${driveId}/folders`, {
    parentId,
    name,
  });
  if (response.status !== 201) {
    throw new Error(`The folder ${name} could not be created (${response.status}).`);
  }
};

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

export const findFolderFrom = async (
  api: APIRequestContext,
  session: Session,
  starts: Container[],
  name: string,
): Promise<string> => {
  const queue: Container[] = [...starts];
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
    queue.push(
      ...items
        .filter((item) => item.isFolder)
        .map((item) => ({ kind: "folder" as const, id: item.id })),
    );
  }
  throw new Error(`The folder ${name} is not found`);
};

export const findFolderAcrossDrives = (
  api: APIRequestContext,
  session: Session,
  drives: Drive[],
  name: string,
): Promise<string> =>
  findFolderFrom(
    api,
    session,
    drives.map((drive) => ({ kind: "drive" as const, id: drive.id })),
    name,
  );

export const uploadFileAs = async (
  api: APIRequestContext,
  session: Session,
  driveId: string,
  upload: {
    readonly name: string;
    readonly parentId: string | null;
    readonly body: string;
    readonly contentType?: string;
  },
): Promise<JsonResponse> => {
  const headers: Record<string, string> = {
    ...bearer(session),
    "content-type": upload.contentType ?? "text/plain",
    [FILE_NAME_HEADER]: encodeURIComponent(upload.name),
  };
  if (upload.parentId !== null) {
    headers[PARENT_ID_HEADER] = upload.parentId;
  }
  const response = await api.post(`/api/drives/${driveId}/files`, {
    headers,
    data: upload.body,
    failOnStatusCode: false,
  });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const findItemAcrossDrives = async (
  api: APIRequestContext,
  session: Session,
  name: string,
): Promise<FileItem> => {
  const drives = await listDrivesAs(api, session);
  for (const drive of drives) {
    const items = await listItemsAs(api, session, { kind: "drive", id: drive.id });
    const match = items.find((item) => item.name === name);
    if (match !== undefined) {
      return match;
    }
  }
  throw new Error(`The entry ${name} is not visible to this person`);
};

export const listVersionsAs = (
  api: APIRequestContext,
  session: Session,
  fileId: string,
): Promise<JsonResponse> => getAs(api, session, `/api/files/${fileId}/versions`);

export const fileDetailsAs = (
  api: APIRequestContext,
  session: Session,
  fileId: string,
): Promise<JsonResponse> => getAs(api, session, `/api/files/${fileId}`);

export const uploadVersionAs = async (
  api: APIRequestContext,
  session: Session,
  fileId: string,
  body: string,
): Promise<JsonResponse> => {
  const response = await api.post(`/api/files/${fileId}/versions`, {
    headers: { ...bearer(session), "content-type": "text/plain" },
    data: body,
    failOnStatusCode: false,
  });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const restoreVersionAs = (
  api: APIRequestContext,
  session: Session,
  fileId: string,
  versionId: string,
): Promise<JsonResponse> =>
  postAs(api, session, `/api/files/${fileId}/versions/${versionId}/restore`, undefined);

export const deleteAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
): Promise<JsonResponse> => {
  const response = await api.delete(path, {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return { status: response.status(), body: await response.json().catch(() => null) };
};

export const deleteVersionAs = (
  api: APIRequestContext,
  session: Session,
  fileId: string,
  versionId: string,
): Promise<JsonResponse> => deleteAs(api, session, `/api/files/${fileId}/versions/${versionId}`);

export const downloadAs = async (
  api: APIRequestContext,
  session: Session,
  path: string,
  headers: Record<string, string> = {},
): Promise<DownloadResponse> => {
  const response = await api.get(path, {
    headers: { ...bearer(session), ...headers },
    failOnStatusCode: false,
  });
  return {
    status: response.status(),
    headers: response.headers(),
    body: (await response.body()).toString("utf8"),
  };
};
