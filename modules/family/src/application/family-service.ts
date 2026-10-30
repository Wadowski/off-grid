import { randomUUID } from "node:crypto";
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { can, type Subject } from "@offgrid/access-control";
import type { Family } from "../domain/family.js";
import { parseFamilyName } from "../domain/family.js";
import { publishFamilyCreated } from "../events/family-created.js";
import {
  findFamily,
  insertFamily,
  insertMembership,
  isMember,
  listSummariesFor,
  setFamilyContext,
  setUserContext,
  type FamilySummaryRow,
} from "../infrastructure/family-store.js";
import { withFamilyTransaction, type FamilyPool } from "../infrastructure/transaction.js";

export type FamilyView =
  | { readonly outcome: "found"; readonly family: Family }
  | { readonly outcome: "not-found" }
  | { readonly outcome: "forbidden" };

export interface FamilyService {
  createFamily(creatorUserId: string, name: string): Promise<Family>;
  getFamily(viewerUserId: string, familyId: string): Promise<FamilyView>;
  listMyFamilies(viewerUserId: string): Promise<FamilySummaryRow[]>;
}

export function createFamilyService(pool: FamilyPool): FamilyService {
  return {
    async createFamily(creatorUserId, rawName) {
      const name = parseFamilyName(rawName);
      const id = randomUUID();
      return withFamilyTransaction(pool, async (client) => {
        await setFamilyContext(client, id);
        const family = await insertFamily(client, { id, name });
        await insertMembership(client, id, creatorUserId);
        await publishFamilyCreated(client, { familyId: id, name, creatorUserId });
        return family;
      });
    },

    async getFamily(viewerUserId, familyId) {
      return withFamilyTransaction(pool, async (client) => {
        await setFamilyContext(client, familyId);
        const family = await findFamily(client, familyId);
        if (family === null) {
          return { outcome: "not-found" };
        }
        const subject: Subject = {
          userId: viewerUserId,
          groups: (await isMember(client, familyId, viewerUserId))
            ? [{ id: familyId, kind: "family" }]
            : [],
        };
        const resource = { owner: { id: familyId, kind: "family" as const }, grants: [] };
        return can(subject, "view", resource)
          ? { outcome: "found", family }
          : { outcome: "forbidden" };
      });
    },

    async listMyFamilies(viewerUserId) {
      return withFamilyTransaction(pool, async (client) => {
        await setUserContext(client, viewerUserId);
        return listSummariesFor(client, viewerUserId);
      });
    },
  };
}
