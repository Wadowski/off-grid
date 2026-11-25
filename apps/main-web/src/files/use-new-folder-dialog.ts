// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useRef, useState } from "react";
import type { NewFolderDialogState } from "./types.js";

export const useNewFolderDialog = (): NewFolderDialogState => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    const active = document.activeElement;
    triggerRef.current = active instanceof HTMLElement ? active : null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return { isOpen, open, close };
};
