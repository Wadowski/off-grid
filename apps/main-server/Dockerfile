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

FROM node:24.22.1-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY --from=manifests /out /repo
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @offgrid/db generate

FROM node:24.22.1-alpine AS runtime
ARG OFFGRID_VERSION=dev
ENV NODE_ENV=production
ENV OFFGRID_VERSION=${OFFGRID_VERSION}
LABEL org.opencontainers.image.version=${OFFGRID_VERSION}
COPY --from=build --chown=node:node /repo /repo
WORKDIR /repo/apps/main-server
USER node
CMD ["node", "--import", "tsx", "src/main.ts"]
