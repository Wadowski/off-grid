// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import type { FileStorage, StoredObject } from "@offgrid/file-storage";
import type { Client } from "pg";

export const bodyOf = (text: string): AsyncIterable<Uint8Array> =>
  Readable.from([Buffer.from(text)]);

export const putBytes = (storage: FileStorage, text: string): Promise<StoredObject> =>
  storage.put(bodyOf(text));

export const readBytes = async (storage: FileStorage, key: string): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of await storage.get(key)) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
};

export const storedKeys = async (storage: FileStorage): Promise<string[]> => {
  const keys: string[] = [];
  for await (const entry of storage.listKeys()) {
    keys.push(entry.key);
  }
  return keys.sort();
};

export const readVersionNumbers = async (admin: Client, fileId: string): Promise<number[]> => {
  const { rows } = await admin.query<{ number: number }>(
    "SELECT number FROM files.file_version WHERE file_id = $1 ORDER BY number",
    [fileId],
  );
  return rows.map((row) => row.number);
};

export const readFileRow = async (
  admin: Client,
  fileId: string,
): Promise<{
  current_version_id: string;
  version: number;
  size_bytes: string;
  mime_type: string;
}> => {
  const { rows } = await admin.query<{
    current_version_id: string;
    version: number;
    size_bytes: string;
    mime_type: string;
  }>(
    "SELECT current_version_id, version, size_bytes, mime_type FROM files.file WHERE file_id = $1",
    [fileId],
  );
  const row = rows[0];
  if (row === undefined) {
    throw new Error("The file row is missing");
  }
  return row;
};

export const countFileUpdatedEvents = async (admin: Client): Promise<number> => {
  const { rows } = await admin.query<{ count: string }>(
    "SELECT count(*) FROM outbox.event WHERE type = 'file-updated-v1'",
  );
  return Number(rows[0]?.count ?? 0);
};
