-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE INDEX calendar_event_range_idx ON calendar.calendar_event (starts_at, ends_at);
