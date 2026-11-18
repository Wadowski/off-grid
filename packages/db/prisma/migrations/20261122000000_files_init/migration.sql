-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE files.drive (
  drive_id   uuid        PRIMARY KEY,
  family_id  uuid,
  user_id    uuid,
  owner_id   uuid        GENERATED ALWAYS AS (COALESCE(family_id, user_id)) STORED,
  kind       text        NOT NULL CHECK (kind IN ('personal', 'family')),
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 255),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'personal') = (user_id IS NOT NULL)),
  UNIQUE (drive_id, owner_id)
);
SELECT public.offgrid_declare_scope('files', 'drive', 'family-or-user');
CREATE UNIQUE INDEX drive_one_per_user_idx ON files.drive (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX drive_one_per_family_idx ON files.drive (family_id) WHERE family_id IS NOT NULL;

CREATE TABLE files.file (
  file_id            uuid        PRIMARY KEY,
  drive_id           uuid        NOT NULL,
  parent_id          uuid,
  family_id          uuid,
  user_id            uuid,
  owner_id           uuid        GENERATED ALWAYS AS (COALESCE(family_id, user_id)) STORED,
  name               text        NOT NULL CHECK (
    char_length(name) BETWEEN 1 AND 255
    AND name !~ '[/\\]'
    AND name NOT IN ('.', '..')
  ),
  is_folder          boolean     NOT NULL,
  mime_type          text        CHECK (mime_type IS NULL OR char_length(mime_type) BETWEEN 1 AND 255),
  size_bytes         bigint      CHECK (size_bytes >= 0),
  current_version_id uuid,
  version            integer     NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz,
  CHECK (parent_id IS NULL OR parent_id <> file_id),
  CHECK (NOT is_folder OR (mime_type IS NULL AND size_bytes IS NULL AND current_version_id IS NULL)),
  CHECK (is_folder OR (mime_type IS NOT NULL AND size_bytes IS NOT NULL)),
  UNIQUE (file_id, drive_id),
  UNIQUE (file_id, owner_id),
  FOREIGN KEY (drive_id, owner_id) REFERENCES files.drive (drive_id, owner_id),
  FOREIGN KEY (parent_id, drive_id) REFERENCES files.file (file_id, drive_id)
);
SELECT public.offgrid_declare_scope('files', 'file', 'family-or-user');
CREATE INDEX file_children_idx ON files.file (drive_id, parent_id, name);
CREATE UNIQUE INDEX file_name_per_parent_idx
  ON files.file (drive_id, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name))
  WHERE deleted_at IS NULL;
CREATE INDEX file_deleted_at_idx ON files.file (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE files.file_version (
  version_id         uuid        PRIMARY KEY,
  file_id            uuid        NOT NULL,
  family_id          uuid,
  user_id            uuid,
  owner_id           uuid        GENERATED ALWAYS AS (COALESCE(family_id, user_id)) STORED,
  number             integer     NOT NULL CHECK (number >= 1),
  storage_key        text        NOT NULL CHECK (char_length(storage_key) BETWEEN 1 AND 128),
  size_bytes         bigint      NOT NULL CHECK (size_bytes >= 0),
  mime_type          text        NOT NULL CHECK (char_length(mime_type) BETWEEN 1 AND 255),
  sha256             text        NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  created_by_user_id uuid        NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (file_id, number),
  UNIQUE (version_id, file_id),
  FOREIGN KEY (file_id, owner_id) REFERENCES files.file (file_id, owner_id)
);
SELECT public.offgrid_declare_scope('files', 'file_version', 'family-or-user');
CREATE INDEX file_version_storage_key_idx ON files.file_version (storage_key);
REVOKE UPDATE ON files.file_version FROM offgrid_app;

ALTER TABLE files.file
  ADD CONSTRAINT file_current_version_fk
  FOREIGN KEY (current_version_id, file_id) REFERENCES files.file_version (version_id, file_id)
  DEFERRABLE INITIALLY DEFERRED;
