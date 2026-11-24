// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "../session/use-session.js";
import { useDrives } from "./use-drives.js";
import { useFamilyMembers } from "./use-family-members.js";
import { useFileVersionAuthors } from "./use-file-version-authors.js";
import type { Drive, FamilyMemberEntry, FileEntry } from "./types.js";

vi.mock("../session/use-session.js", () => ({ useSession: vi.fn() }));
vi.mock("./use-drives.js", () => ({ useDrives: vi.fn() }));
vi.mock("./use-family-members.js", () => ({ useFamilyMembers: vi.fn() }));

const DRIVE_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d" as FileEntry["driveId"];
const FAMILY_ID = "a0000000-0000-4000-8000-000000000001";
const VIEWER_ID = "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b";
const MEMBER_ID = "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c";
const MEMBER = { userId: MEMBER_ID, displayName: "Ben" } as FamilyMemberEntry;

const signedInAs = (id: string, displayName: string) =>
  vi.mocked(useSession).mockReturnValue({
    status: "signedIn",
    user: { id, displayName, email: "anna@example.test", instanceRole: "member" },
    families: [],
    activeFamilyId: FAMILY_ID,
  } as never);

beforeEach(() => {
  vi.mocked(useDrives).mockReturnValue({
    drives: [{ id: DRIVE_ID, familyId: FAMILY_ID, name: "Home" } as Drive],
  } as never);
  vi.mocked(useFamilyMembers).mockReturnValue({ members: [MEMBER] } as never);
  signedInAs(VIEWER_ID, "Anna");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useFileVersionAuthors", () => {
  it("loads the members of the family that owns the file's drive", () => {
    renderHook(() => useFileVersionAuthors(DRIVE_ID));

    expect(useFamilyMembers).toHaveBeenCalledWith(FAMILY_ID);
  });

  it("names a family member who saved a version", () => {
    const { result } = renderHook(() => useFileVersionAuthors(DRIVE_ID));

    expect(result.current(MEMBER_ID)).toBe("Ben");
  });

  it("names the signed-in viewer", () => {
    const { result } = renderHook(() => useFileVersionAuthors(DRIVE_ID));

    expect(result.current(VIEWER_ID)).toBe("Anna");
  });

  it("returns null for someone who is no longer a member", () => {
    const { result } = renderHook(() => useFileVersionAuthors(DRIVE_ID));

    expect(result.current("9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d")).toBeNull();
  });
});
