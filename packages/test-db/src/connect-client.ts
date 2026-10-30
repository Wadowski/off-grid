// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { connectionFor } from "./connection-for.js";
import type { DatabaseTarget } from "./types.js";

export const connectClient = async (
  target: DatabaseTarget,
  clients: Client[],
  schema: string,
): Promise<Client> => {
  const client = new Client(connectionFor(target, schema));
  await client.connect();
  clients.push(client);
  return client;
};
