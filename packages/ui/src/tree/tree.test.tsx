// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tree } from "./tree.js";
import type { TreeNode } from "./types.js";

const documents: TreeNode = {
  id: "documents",
  label: "Documents",
  icon: "folder",
  hasChildren: true,
  disabled: false,
  children: [
    { id: "taxes", label: "Taxes", icon: "folder", hasChildren: false, disabled: false },
    { id: "photos", label: "Photos", icon: "folder", hasChildren: true, disabled: true },
  ],
};

const roots: readonly TreeNode[] = [
  documents,
  { id: "archive", label: "Archive", icon: "folder", hasChildren: true, disabled: false },
];

const renderTree = (expandedIds: ReadonlySet<string>, selectedId: string | null = null) => {
  const onSelect = vi.fn();
  const onToggle = vi.fn();
  render(
    <Tree
      label="Folders"
      nodes={roots}
      expandedIds={expandedIds}
      selectedId={selectedId}
      onSelect={onSelect}
      onToggle={onToggle}
      testId="tree"
      nodeTestIdPrefix="node-"
    />,
  );
  return { onSelect, onToggle };
};

const itemFor = (id: string) => screen.getByTestId(`node-${id}`);

describe("Tree", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a labelled tree with treeitems and group levels", () => {
    renderTree(new Set(["documents"]));

    expect(screen.getByRole("tree", { name: "Folders" })).toBeInTheDocument();
    expect(itemFor("documents")).toHaveAttribute("aria-level", "1");
    expect(itemFor("taxes")).toHaveAttribute("aria-level", "2");
    expect(screen.getAllByRole("group")).toHaveLength(1);
  });

  it("hides children of collapsed nodes", () => {
    renderTree(new Set());

    expect(screen.queryByTestId("node-taxes")).not.toBeInTheDocument();
    expect(itemFor("documents")).toHaveAttribute("aria-expanded", "false");
  });

  it("marks disabled items with aria-disabled and does not select them on click", () => {
    const { onSelect } = renderTree(new Set(["documents"]));

    expect(itemFor("photos")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(screen.getByText("Photos"));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects an enabled item on click and on Enter", () => {
    const { onSelect } = renderTree(new Set());

    fireEvent.click(screen.getByText("Archive"));
    fireEvent.keyDown(itemFor("archive"), { key: "Enter" });

    expect(onSelect).toHaveBeenNthCalledWith(1, "archive");
    expect(onSelect).toHaveBeenNthCalledWith(2, "archive");
  });

  it("expands with ArrowRight and collapses with ArrowLeft", () => {
    const collapsed = renderTree(new Set(), "documents");
    fireEvent.keyDown(itemFor("documents"), { key: "ArrowRight" });
    expect(collapsed.onToggle).toHaveBeenLastCalledWith("documents");
    cleanup();

    const expanded = renderTree(new Set(["documents"]));
    fireEvent.keyDown(itemFor("documents"), { key: "ArrowLeft" });
    expect(expanded.onToggle).toHaveBeenLastCalledWith("documents");
  });

  it("moves focus with ArrowDown, ArrowUp, Home and End", () => {
    renderTree(new Set(["documents"]));

    itemFor("documents").focus();
    fireEvent.keyDown(itemFor("documents"), { key: "ArrowDown" });
    expect(itemFor("taxes")).toHaveFocus();

    fireEvent.keyDown(itemFor("taxes"), { key: "End" });
    expect(itemFor("archive")).toHaveFocus();

    fireEvent.keyDown(itemFor("archive"), { key: "ArrowUp" });
    expect(itemFor("photos")).toHaveFocus();

    fireEvent.keyDown(itemFor("photos"), { key: "Home" });
    expect(itemFor("documents")).toHaveFocus();
  });

  it("moves focus into an expanded node with ArrowRight and back with ArrowLeft", () => {
    renderTree(new Set(["documents"]));

    itemFor("documents").focus();
    fireEvent.keyDown(itemFor("documents"), { key: "ArrowRight" });
    expect(itemFor("taxes")).toHaveFocus();

    fireEvent.keyDown(itemFor("taxes"), { key: "ArrowLeft" });
    expect(itemFor("documents")).toHaveFocus();
  });

  it("keeps a single tab stop on the focused item", () => {
    renderTree(new Set(["documents"]), "taxes");

    expect(itemFor("taxes")).toHaveAttribute("tabindex", "0");
    expect(itemFor("documents")).toHaveAttribute("tabindex", "-1");
  });

  it("renders the footer row inside an expanded node", () => {
    const Harness = () => {
      const [expanded] = useState(new Set(["archive"]));
      return (
        <Tree
          label="Folders"
          nodes={roots}
          expandedIds={expanded}
          selectedId={null}
          onSelect={vi.fn()}
          onToggle={vi.fn()}
          renderFooter={(node) => (node.id === "archive" ? <span>Load more</span> : null)}
        />
      );
    };
    render(<Harness />);

    expect(screen.getByText("Load more")).toBeInTheDocument();
  });
});
