// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text } from "@offgrid/ui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FamilyInviteDialog } from "../../families/family-invite-dialog/family-invite-dialog.js";
import { changeFamilyMemberRole } from "../../families/change-family-member-role.js";
import { listFamilyMembers } from "../../families/list-family-members.js";
import { removeFamilyMember } from "../../families/remove-family-member.js";
import { FamilyMemberList } from "../../lists/family-member-list/family-member-list.js";
import { useSession } from "../../session/use-session.js";
import type { CurrentUserRole, FamilyMember, FamiliesContext, ListStatus } from "../../types.js";
import type { FamilyManagerErrorTextId } from "./types.js";
import {
  familyManagerHeaderStyle,
  familyManagerIntroStyle,
  familyManagerPageStyle,
} from "./styles.js";

export const FamilyManagerPage = () => {
  const { familyId = "" } = useParams();
  const navigate = useNavigate();
  const { families, listStatus, refreshFamilies } = useOutletContext<FamiliesContext>();
  const session = useSession();
  const [members, setMembers] = useState<readonly FamilyMember[]>([]);
  const [membersStatus, setMembersStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FamilyManagerErrorTextId | undefined>(undefined);
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setMembers(await listFamilyMembers(familyId));
      setMembersStatus("ready");
    } catch {
      setMembersStatus("failed");
    }
  }, [familyId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  if (session.status !== "signedIn") {
    return null;
  }
  const space = families.find((family) => family.id === familyId);
  if (listStatus === "ready" && space === undefined) {
    return (
      <div style={familyManagerPageStyle}>
        <Text variant="status" textId="familyManager.notFound" />
      </div>
    );
  }
  const canManage = space?.role === "admin";
  const selfUserId = session.user.id;

  const errorFor = (error: unknown, fallback: FamilyManagerErrorTextId) =>
    error instanceof ApiError && error.code === "LAST_ADMIN" ? "familyManager.lastAdmin" : fallback;

  const changeRole = async (userId: string, role: CurrentUserRole) => {
    setErrorTextId(undefined);
    try {
      await changeFamilyMemberRole(familyId, userId, role);
    } catch (error) {
      setErrorTextId(errorFor(error, "familyManager.changeRoleFailed"));
      return;
    }
    await Promise.all([loadMembers(), refreshFamilies()]);
  };

  const removeMember = async (userId: string) => {
    setErrorTextId(undefined);
    try {
      await removeFamilyMember(familyId, userId);
    } catch (error) {
      setErrorTextId(errorFor(error, "familyManager.removeFailed"));
      return;
    }
    if (userId === selfUserId) {
      await refreshFamilies();
      navigate("/settings/families");
      return;
    }
    await loadMembers();
  };

  return (
    <section style={familyManagerPageStyle}>
      <div style={familyManagerHeaderStyle}>
        <div style={familyManagerIntroStyle}>
          <Text variant="subheading" textId="familyManager.heading" />
          <Text variant="body" textId="familyManager.description" />
        </div>
        {canManage && (
          <Button variant="primary" size="small" onClick={() => setInviteOpen(true)}>
            <Text variant="action" textId="familyManager.invite" />
          </Button>
        )}
      </div>
      {membersStatus === "loading" && <Text variant="status" textId="familyManager.loading" />}
      {membersStatus === "failed" && (
        <div role="alert">
          <Text variant="error" textId="familyManager.loadFailed" />
        </div>
      )}
      {membersStatus === "ready" && (
        <FamilyMemberList
          members={members}
          selfUserId={selfUserId}
          canManage={canManage}
          onChangeRole={(userId, role) => void changeRole(userId, role)}
          onRemove={(userId) => void removeMember(userId)}
        />
      )}
      {errorTextId !== undefined && (
        <div role="alert">
          <Text variant="error" textId={errorTextId} />
        </div>
      )}
      {inviteOpen && (
        <FamilyInviteDialog familyId={familyId} onClose={() => setInviteOpen(false)} />
      )}
    </section>
  );
};
