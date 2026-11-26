// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook } from "@testing-library/react";
import type { DragEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useFileDragState } from "./use-file-drag-state.js";

const eventWith = (types: readonly string[], items: readonly unknown[] = []) =>
  ({
    dataTransfer: { types, items, dropEffect: "none" },
    preventDefault: vi.fn(),
  }) as unknown as DragEvent<HTMLElement>;

const FILES_DRAG = ["Files"];
const TEXT_DRAG = ["text/plain"];

describe("useFileDragState", () => {
  it("shows the drop state while files are dragged in", () => {
    const { result } = renderHook(() => useFileDragState(true, vi.fn()));

    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));

    expect(result.current.isDragging).toBe(true);
  });

  it("keeps the drop state while the pointer moves between child elements", () => {
    const { result } = renderHook(() => useFileDragState(true, vi.fn()));

    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));
    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));
    act(() => result.current.onDragLeave(eventWith(FILES_DRAG)));

    expect(result.current.isDragging).toBe(true);

    act(() => result.current.onDragLeave(eventWith(FILES_DRAG)));

    expect(result.current.isDragging).toBe(false);
  });

  it("ignores a drag of text", () => {
    const { result } = renderHook(() => useFileDragState(true, vi.fn()));

    act(() => result.current.onDragEnter(eventWith(TEXT_DRAG)));

    expect(result.current.isDragging).toBe(false);
  });

  it("never shows the drop state while upload is disabled", () => {
    const { result } = renderHook(() => useFileDragState(false, vi.fn()));

    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));

    expect(result.current.isDragging).toBe(false);
  });

  it("hides the drop state and passes the dropped files on", () => {
    const onFilesDropped = vi.fn();
    const file = new File(["a"], "a.txt");
    const item = { kind: "file", getAsFile: () => file } as unknown as DataTransferItem;
    const { result } = renderHook(() => useFileDragState(true, onFilesDropped));
    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));

    act(() => result.current.onDrop(eventWith(FILES_DRAG, [item])));

    expect(result.current.isDragging).toBe(false);
    expect(onFilesDropped).toHaveBeenCalledWith([file]);
  });

  it("drops without passing files on while upload is disabled", () => {
    const onFilesDropped = vi.fn();
    const { result } = renderHook(() => useFileDragState(false, onFilesDropped));

    act(() => result.current.onDrop(eventWith(FILES_DRAG, [])));

    expect(onFilesDropped).not.toHaveBeenCalled();
  });

  it("hides the drop state when the drag ends outside the page", () => {
    const { result } = renderHook(() => useFileDragState(true, vi.fn()));
    act(() => result.current.onDragEnter(eventWith(FILES_DRAG)));

    act(() => {
      window.dispatchEvent(new Event("dragend"));
    });

    expect(result.current.isDragging).toBe(false);
  });
});
