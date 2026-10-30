-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- The bus reads and writes the event log only through the definer functions above,
-- so its login gets no direct table privileges. See docs/adr/0012.
REVOKE SELECT, INSERT, UPDATE, DELETE ON outbox.event, outbox.dead_letter FROM outbox_app;
