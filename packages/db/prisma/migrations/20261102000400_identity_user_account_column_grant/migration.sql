-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

REVOKE UPDATE ON identity.user_account FROM offgrid_app;
GRANT UPDATE (status) ON identity.user_account TO offgrid_app;
