// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { CurrentUser } from "../../../../types.js";
import {
  userMenuIdentityStyle,
  userMenuItemStyle,
  userMenuPanelStyle,
  userMenuStyle,
  userMenuTriggerStyle,
} from "./styles.js";

type UserMenuProps = {
  readonly user: CurrentUser;
  readonly onSignOut: () => void;
};

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

export const UserMenu = ({ user, onSignOut }: UserMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    }
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isOpen) {
      closeMenu();
    }
  };

  const roleTextId = user.role === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember";

  return (
    <div style={userMenuStyle} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="og-focusable"
        style={userMenuTriggerStyle}
        aria-label={t("userMenu.trigger")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">{initialsOf(user.name)}</span>
      </button>
      {isOpen && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={t("userMenu.label")}
          style={userMenuPanelStyle}
        >
          <div style={userMenuIdentityStyle}>
            <Text variant="label" value={user.name} />
            <Text variant="status" value={user.email} />
            <Text variant="label" textId={roleTextId} />
          </div>
          <Link role="menuitem" to="/settings" style={userMenuItemStyle} onClick={closeMenu}>
            {t("userMenu.accountAndSecurity")}
          </Link>
          {user.role === "admin" && (
            <Link role="menuitem" to="/admin" style={userMenuItemStyle} onClick={closeMenu}>
              {t("userMenu.adminSettings")}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            className="og-focusable"
            style={userMenuItemStyle}
            onClick={onSignOut}
          >
            {t("userMenu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};
