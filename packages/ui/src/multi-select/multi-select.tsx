// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Checkbox } from "../checkbox/checkbox.js";
import { Text } from "../text/text.js";
import {
  multiSelectAdornmentStyle,
  multiSelectPanelStyle,
  multiSelectStyle,
  multiSelectTriggerStyle,
} from "./styles.js";
import type { MultiSelectProps } from "./types.js";

export const MultiSelect = ({
  options,
  selected,
  onChange,
  summary,
  triggerLabel,
  groupLabel,
  testId,
}: MultiSelectProps) => {
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  const toggle = (value: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) {
      next.add(value);
    } else {
      next.delete(value);
    }
    onChange(next);
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} style={multiSelectStyle} onKeyDown={closeOnEscape}>
      <button
        ref={triggerRef}
        type="button"
        className="og-focusable"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid={`${testId}-trigger`}
        style={multiSelectTriggerStyle}
        onClick={() => setOpen((current) => !current)}
      >
        <Text variant="action" value={summary} />
      </button>
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={groupLabel}
          data-testid={`${testId}-panel`}
          style={multiSelectPanelStyle}
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={
                <>
                  {option.adornment !== undefined && (
                    <span aria-hidden="true" style={multiSelectAdornmentStyle}>
                      {option.adornment}
                    </span>
                  )}
                  {option.label}
                </>
              }
              checked={selected.has(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
              data-testid={`${testId}-${option.value}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
