// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrashNotice } from "./trash-notice.js";

describe("TrashNotice", () => {
  it("keeps an empty status region when nothing was moved to the trash", () => {
    render(<TrashNotice name={null} onDismiss={vi.fn()} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("announces the name of the entry that was moved to the trash", () => {
    render(<TrashNotice name="Insurance policy.txt" onDismiss={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      '"Insurance policy.txt" was moved to the trash.',
    );
  });

  it("dismisses the notice from its dismiss button", () => {
    const onDismiss = vi.fn();
    render(<TrashNotice name="Photos" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
