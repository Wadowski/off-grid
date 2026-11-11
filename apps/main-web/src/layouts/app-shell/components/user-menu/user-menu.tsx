// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { initialsOf } from "../../../../session/initials-of.js";
import type { CurrentUser } from "../../../../types.js";
import {
  userMenuIdentityStyle,
  userMenuItemStyle,
  userMenuPanelStyle,
  userMenuStyle,
} from "./styles.js";
import type { UserMenuProps } from "./types.js";

const roleTextIdOf = (user: CurrentUser): "userMenu.roleAdmin" | "userMenu.roleMember" =>
  user.role === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember";

export const UserMenu = ({ user, onSignOut }: UserMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    }
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    menuRef.current?.querySelector<HTMLButtonElement>("[aria-haspopup='menu']")?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isOpen) {
      closeMenu();
    }
  };

  return (
    <div ref={menuRef} className="og-user-menu" style={userMenuStyle} onKeyDown={handleKeyDown}>
      <Button
        variant="secondary"
        aria-label={`${t("userMenu.trigger")}, ${user.name}, ${t(roleTextIdOf(user))}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className="og-user-menu-avatar"
          data-initials={initialsOf(user.name)}
          aria-hidden="true"
        />
        <span className="og-user-menu-meta" aria-hidden="true">
          <Text variant="label" value={user.name} />{" "}
          <Text variant="caption" textId={roleTextIdOf(user)} />
        </span>
        <span className="og-user-menu-expand" aria-hidden="true">
          <MaterialIcon name="expand_more" size="18px" color="currentColor" />
        </span>
      </Button>
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
            <Text variant="label" textId={roleTextIdOf(user)} />
          </div>
          <Link role="menuitem" to="/settings" style={userMenuItemStyle} onClick={closeMenu}>
            {t("userMenu.accountAndSecurity")}
          </Link>
          {user.role === "admin" && (
            <Link role="menuitem" to="/admin" style={userMenuItemStyle} onClick={closeMenu}>
              {t("userMenu.adminSettings")}
            </Link>
          )}
          <Button role="menuitem" variant="ghost" onClick={onSignOut}>
            <Text variant="label" textId="userMenu.signOut" />
          </Button>
        </div>
      )}
    </div>
  );
};
