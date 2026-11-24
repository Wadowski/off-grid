// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent } from "react";
import { useLayoutEffect, useRef } from "react";
import { floatingPanelStyle } from "./styles.js";
import type { FloatingPanelProps } from "./types.js";

export const FloatingPanel = ({
  placement,
  labelledBy,
  onEscape,
  testId,
  children,
}: FloatingPanelProps) => {
  const panelRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    return () => {
      if (panel?.contains(document.activeElement) === true) {
        document.querySelector<HTMLElement>("main")?.focus();
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && onEscape !== undefined) {
      event.stopPropagation();
      onEscape();
    }
  };

  return (
    <section
      ref={panelRef}
      role="region"
      aria-labelledby={labelledBy}
      style={floatingPanelStyle(placement)}
      onKeyDown={handleKeyDown}
      data-testid={testId}
      data-placement={placement}
    >
      {children}
    </section>
  );
};
