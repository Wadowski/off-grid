// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AdminUser } from "@offgrid/contracts";
import { Text } from "@offgrid/ui";
import { useEffect, useState } from "react";
import { webAdminClient } from "../../api/web-api-client.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { useSession } from "../../session/use-session.js";
import { SettingsSection } from "../settings-page/components/settings-section/settings-section.js";
import { AdminPeopleSection } from "./components/admin-people-section/admin-people-section.js";
import { AdminRegistrationSection } from "./components/admin-registration-section/admin-registration-section.js";
import { ADMIN_MAIL_SECTION } from "./constants.js";

export const AdminPage = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return null;
  }
  if (session.user.instanceRole !== "admin") {
    return (
      <SettingsSubpage titleTextId="admin.heading">
        <Text variant="body" textId="admin.noAccess" />
      </SettingsSubpage>
    );
  }
  return <AdminContent />;
};

const AdminContent = () => {
  const [users, setUsers] = useState<readonly AdminUser[]>();
  const [registrationOpen, setRegistrationOpen] = useState<boolean>();
  const [loadFailed, setLoadFailed] = useState(false);

  const loadUsers = async () => {
    try {
      setUsers((await webAdminClient.users()).users);
    } catch {
      setLoadFailed(true);
    }
  };

  useEffect(() => {
    Promise.all([webAdminClient.users(), webAdminClient.instanceSettings()])
      .then(([userList, settings]) => {
        setUsers(userList.users);
        setRegistrationOpen(settings.registrationOpen);
      })
      .catch(() => setLoadFailed(true));
  }, []);

  if (loadFailed) {
    return (
      <SettingsSubpage titleTextId="admin.heading">
        <Text variant="error" textId="admin.loadFailed" />
      </SettingsSubpage>
    );
  }
  if (users === undefined || registrationOpen === undefined) {
    return null;
  }

  return (
    <SettingsSubpage titleTextId="admin.heading">
      <AdminRegistrationSection
        registrationOpen={registrationOpen}
        onChange={setRegistrationOpen}
      />
      <AdminPeopleSection users={users} onChanged={loadUsers} />
      <SettingsSection section={ADMIN_MAIL_SECTION} />
    </SettingsSubpage>
  );
};
