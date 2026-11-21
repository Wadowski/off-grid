// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useSession } from "../../session/use-session.js";
import { AdminPage } from "./admin-page.js";

vi.mock("../../session/use-session.js", () => ({
  useSession: vi.fn(),
}));

vi.mock("../../api/web-api-client.js", () => ({
  webAdminClient: { users: vi.fn(), instanceSettings: vi.fn() },
  webSystemClient: { update: vi.fn() },
}));

const sessionAs = (instanceRole: "admin" | "member") => ({
  status: "signedIn",
  user: { id: "user-1", displayName: "Test", email: "test@example.com", instanceRole },
});

describe("AdminPage", () => {
  it("shows only the no-access text and no software update section to a non-admin", () => {
    vi.mocked(useSession).mockReturnValue(sessionAs("member") as ReturnType<typeof useSession>);

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("You do not have access", { exact: true })).toBeInTheDocument();
    expect(screen.queryByText("Software update", { exact: true })).not.toBeInTheDocument();
  });
});
