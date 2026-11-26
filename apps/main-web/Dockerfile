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
ARG VITE_API_ORIGIN=""
ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}
RUN pnpm --filter @offgrid/main-web build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
ARG OFFGRID_VERSION=dev
LABEL org.opencontainers.image.version=${OFFGRID_VERSION}
COPY apps/main-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/main-web/dist /usr/share/nginx/html
