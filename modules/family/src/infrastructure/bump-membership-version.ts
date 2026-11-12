import type { ModuleTransaction } from "@offgrid/db";

export const bumpMembershipVersion = async (
  tx: ModuleTransaction,
  familyId: string,
  userId: string,
): Promise<number> => {
  const record = await tx.familyMembershipVersion.upsert({
    where: { familyId_userId: { familyId, userId } },
    create: { familyId, userId, sourceVersion: 1 },
    update: { sourceVersion: { increment: 1 } },
  });
  return record.sourceVersion;
};
