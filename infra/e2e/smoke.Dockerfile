# syntax=docker/dockerfile:1.10
# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

FROM node:24.22.1-alpine AS manifests
WORKDIR /src
COPY . .
RUN mkdir /out \
 && find . \( -name node_modules -o -name .git -o -name .claude \) -prune -o \
      \( -name package.json -o -name pnpm-lock.yaml -o -name pnpm-workspace.yaml -o -name .npmrc \) -print \
      | tar -cf - -T - | tar -xf - -C /out

FROM mcr.microsoft.com/playwright:v1.64.1-noble AS smoke

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg nginx \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
      https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt noble-pgdg main" \
      > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends postgresql-17 postgresql-client-17 \
 && rm -rf /var/lib/apt/lists/*

COPY --from=axllent/mailpit:v1.31.6 /mailpit /usr/local/bin/mailpit

WORKDIR /repo

COPY --from=manifests /out /repo
RUN npm install --global pnpm@12.15.0
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @offgrid/db generate \
 && VITE_API_ORIGIN=http://127.0.0.1:3000 pnpm --filter @offgrid/main-web build

ENV NODE_ENV=production
ENTRYPOINT ["bash", "/repo/infra/e2e/smoke-entrypoint.sh"]
