// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AccessRow } from "./access-row.js";

describe("AccessRow", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the name, the initials, the role and Can edit", () => {
    render(
      <ul>
        <AccessRow name="Anna Kowalska" role="owner" isFirst />
      </ul>,
    );

    expect(screen.getByText("Anna Kowalska")).toBeInTheDocument();
    expect(screen.getByText("AK")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Can edit")).toBeInTheDocument();
  });

  it("shows a neutral label when the name is not known", () => {
    render(
      <ul>
        <AccessRow name={null} role="member" isFirst={false} />
      </ul>,
    );

    expect(screen.getByText("Family member")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
