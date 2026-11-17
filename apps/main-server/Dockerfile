# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

FROM node:24.22.1-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @offgrid/db generate

FROM node:24.22.1-alpine AS runtime
ARG OFFGRID_VERSION=""
ENV NODE_ENV=production
ENV OFFGRID_VERSION=${OFFGRID_VERSION}
LABEL org.opencontainers.image.version=${OFFGRID_VERSION}
COPY --from=build --chown=node:node /repo /repo
WORKDIR /repo/apps/main-server
USER node
CMD ["node", "--import", "tsx", "src/main.ts"]
