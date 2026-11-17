// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "../../test/render-with-i18n.js";
import { FileCard } from "./file-card.js";

const NOW = new Date("2026-11-17T12:00:00Z");
const OCTOBER = new Date("2026-10-18T09:00:00Z");

describe("FileCard", () => {
  it("shows the name, size and last change of a file with its kind badge", () => {
    renderWithI18n(
      <FileCard
        name="Policy.pdf"
        kind="pdf"
        sizeBytes={2_800_000}
        modifiedAt={OCTOBER}
        locale="en"
        now={NOW}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("file-name")).toHaveTextContent("Policy.pdf");
    expect(screen.getByTestId("file-size")).toHaveTextContent("2.8 MB");
    expect(screen.getByTestId("file-modified")).toHaveTextContent("Oct 18");
    expect(screen.getByTestId("file-kind-badge")).toHaveTextContent("PDF");
  });

  it("shows the large type icon as the placeholder in the media area", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" />);

    const media = screen.getByTestId("file-card-media");
    expect(within(media).getByTestId("file-type-icon")).toHaveAttribute("data-kind", "pdf");
  });

  it("shows the media given to it in place of the placeholder", () => {
    renderWithI18n(
      <FileCard name="Photo.jpg" kind="image" media={<span data-testid="preview" />} />,
    );

    const media = screen.getByTestId("file-card-media");
    expect(within(media).getByTestId("preview")).toBeInTheDocument();
    expect(within(media).queryByTestId("file-type-icon")).not.toBeInTheDocument();
  });

  it("does not load any image by itself", () => {
    const { container } = renderWithI18n(<FileCard name="Photo.jpg" kind="image" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("shows a folder with its item count and without a media area", () => {
    renderWithI18n(<FileCard name="Photos" kind="folder" itemCount={184} sizeBytes={10} />);

    expect(screen.getByTestId("file-size")).toHaveTextContent("184 items");
    expect(screen.queryByTestId("file-card-media")).not.toBeInTheDocument();
    expect(screen.getByTestId("file-type-icon")).toHaveAttribute("data-kind", "folder");
  });

  it("keeps a long name on one line and readable in full through its title", () => {
    const name = "a-very-long-file-name-".repeat(10);
    renderWithI18n(<FileCard name={name} kind="document" />);

    const label = screen.getByTestId("file-name");
    expect(label).toHaveAttribute("title", name);
    expect(label.style.textOverflow).toBe("ellipsis");
  });

  it("marks a selected card with the accent ring", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" selected />);

    const card = screen.getByTestId("file-card");
    expect(card).toHaveAttribute("data-selected", "true");
    expect(card.style.boxShadow).toContain("var(--og-color-accent)");
  });

  it("shows no ring when it is not selected", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" />);

    expect(screen.getByTestId("file-card")).toHaveAttribute("data-selected", "false");
    expect(screen.getByTestId("file-card").style.boxShadow).toBe("none");
  });

  it("shows the trailing content outside the activatable area", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" trailing={<button>More</button>} />);

    const trailing = screen.getByTestId("file-card-trailing");
    expect(within(trailing).getByRole("button", { name: "More" })).toBeInTheDocument();
    expect(screen.getByTestId("file-card-activate")).not.toContainElement(trailing);
  });

  it("is not a button without an activate handler", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is a button named by the file name that activates on click, Enter and Space", () => {
    const onActivate = vi.fn();
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" onActivate={onActivate} />);
    const button = screen.getByRole("button", { name: "Policy.pdf" });

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(button, { key: "x" });

    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it("does not activate from the trailing content", () => {
    const onActivate = vi.fn();
    renderWithI18n(
      <FileCard
        name="Policy.pdf"
        kind="pdf"
        onActivate={onActivate}
        trailing={<button>More</button>}
      />,
    );
    const more = screen.getByRole("button", { name: "More" });

    fireEvent.click(more);
    fireEvent.keyDown(more, { key: " " });

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("uses only design tokens for colour", () => {
    renderWithI18n(<FileCard name="Policy.pdf" kind="pdf" selected />);

    expect(screen.getByTestId("file-card").getAttribute("style") ?? "").not.toMatch(
      /#[0-9a-f]{3,8}/i,
    );
  });
});
