# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

FROM node:24.22.1-alpine AS build
ARG VITE_API_ORIGIN=""
ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @offgrid/main-web build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY apps/main-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/main-web/dist /usr/share/nginx/html
