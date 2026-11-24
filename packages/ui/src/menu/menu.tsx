// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Fragment, useEffect, useRef, useState } from "react";
import { cssVar } from "../css-var.js";
import { Button } from "../button/button.js";
import { MaterialIcon } from "../material-icon/material-icon.js";
import { MenuItem } from "./components/menu-item/menu-item.js";
import { menuDividerStyle, menuPanelStyle } from "./styles.js";
import { toMenuKeyDown } from "./to-menu-key-down.js";
import { toMenuPanelPosition } from "./to-menu-panel-position.js";
import type { MenuProps } from "./types.js";

export const Menu = ({
  label,
  items,
  triggerTestId,
  menuTestId,
  triggerRef: externalTriggerRef,
}: MenuProps) => {
  const internalTriggerRef = useRef<HTMLButtonElement>(null);
  const triggerRef = externalTriggerRef ?? internalTriggerRef;
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = (restoreFocus: boolean) => {
    panelRef.current?.hidePopover();
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const focusItem = (fromEnd: boolean) => {
    const menuItems = panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [];
    menuItems[fromEnd ? menuItems.length - 1 : 0]?.focus();
  };

  const open = (fromEnd: boolean) => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (panel === null || trigger === null) {
      return;
    }
    panel.showPopover();
    const position = toMenuPanelPosition(
      trigger.getBoundingClientRect(),
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    panel.style.top = `${position.top}px`;
    panel.style.left = `${position.left}px`;
    setIsOpen(true);
    focusItem(fromEnd);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (panelRef.current?.contains(target) || triggerRef.current?.contains(target))
      ) {
        return;
      }
      close(false);
    };
    const closeOnViewportMove = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current?.contains(target)) {
        return;
      }
      close(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("scroll", closeOnViewportMove, true);
    window.addEventListener("resize", closeOnViewportMove);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("scroll", closeOnViewportMove, true);
      window.removeEventListener("resize", closeOnViewportMove);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid={triggerTestId}
        onClick={() => (isOpen ? close(true) : open(false))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            open(event.key === "ArrowUp");
          }
        }}
      >
        <MaterialIcon name="more_vert" size="1.5rem" color={cssVar("color-muted")} />
      </Button>
      <div
        ref={panelRef}
        popover="manual"
        role="menu"
        aria-label={label}
        style={menuPanelStyle}
        data-testid={menuTestId}
        onKeyDown={toMenuKeyDown(panelRef, close)}
      >
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {item.tone === "danger" && index > 0 ? (
              <div role="separator" style={menuDividerStyle} />
            ) : null}
            <MenuItem
              textId={item.textId}
              icon={item.icon}
              tone={item.tone}
              testId={item.testId}
              onSelect={() => {
                close(false);
                item.onSelect();
              }}
            />
          </Fragment>
        ))}
      </div>
    </>
  );
};
