-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
CREATE TABLE access.should_not_exist (id uuid PRIMARY KEY);
SELECT no_such_function();
