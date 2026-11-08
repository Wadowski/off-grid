// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { webAdminClient } from "../../api/web-api-client.js";
import { useSession } from "../../session/use-session.js";
import { AdminPeopleSection } from "./components/admin-people-section/admin-people-section.js";
import { AdminRegistrationSection } from "./components/admin-registration-section/admin-registration-section.js";
import { adminPageStyle } from "./styles.js";
import type { AdminUser } from "@offgrid/contracts";

export const AdminPage = () => {
  const session = useSession();
  if (session.status !== "signedIn") {
    return null;
  }
  if (session.user.instanceRole !== "admin") {
    return (
      <div style={adminPageStyle}>
        <Text variant="heading" textId="admin.heading" />
        <Text variant="body" textId="admin.noAccess" />
      </div>
    );
  }
  return <AdminContent />;
};

const AdminContent = () => {
  const [users, setUsers] = useState<readonly AdminUser[]>();
  const [registrationOpen, setRegistrationOpen] = useState<boolean>();
  const [loadFailed, setLoadFailed] = useState(false);

  const loadUsers = async () => {
    setUsers((await webAdminClient.users()).users);
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
    return <Text variant="error" textId="admin.loadFailed" />;
  }
  if (users === undefined || registrationOpen === undefined) {
    return null;
  }

  return (
    <div style={adminPageStyle}>
      <Text variant="heading" textId="admin.heading" />
      <AdminRegistrationSection
        registrationOpen={registrationOpen}
        onChange={setRegistrationOpen}
      />
      <AdminPeopleSection users={users} onChanged={loadUsers} />
      <Link to="/admin/email">
        <Text variant="action" textId="admin.emailLink" />
      </Link>
    </div>
  );
};
