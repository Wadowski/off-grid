// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RELEASE_FILE_NAMES = [
  "release-manifest.json",
  "docker-compose.production.yml",
  "production.env.example",
  "SHA256SUMS",
] as const;

export const MANIFEST_FILE_NAME = "release-manifest.json";

export const RELEASES_FOLDER = "releases";

export const LATEST_VERSION_FILE = "latest-version";

export const REQUEST_LOG_FILE = "requests.log";

export const RELEASE_REPOSITORY_PATH = "[^/]+/[^/]+";

export const ASSET_ID_STRIDE = 10;

export const FAKE_RELEASE_REPOSITORY = "offgrid-e2e/offgrid";

export const FAKE_RELEASE_HOST_NAME = "host.docker.internal";

export const NOT_FOUND_RESPONSE = {
  status: 404,
  contentType: "application/json",
  body: JSON.stringify({ message: "Not Found" }),
} as const;

export const STACK_VERSION = "1.0.0";

export const GOOD_RELEASE_VERSIONS = ["1.1.0", "1.2.0", "1.3.0"] as const;

export const FAILING_RELEASE_VERSION = "1.9.0";

export const FAKE_IMAGE_OWNER = "offgrid-e2e";

export const MANIFEST_IMAGE_HOST = "ghcr.io";

export const RELEASE_SERVICES = ["server", "web", "updater"] as const;

export const IMAGE_NAMES = {
  server: "offgrid-main-server",
  web: "offgrid-main-web",
  updater: "offgrid-updater",
} as const;

export const FAKE_COMMIT = "0123456789abcdef0123456789abcdef01234567";

export const MINIMUM_PREVIOUS_VERSION = "1.0.0";

export const VERSION_LABEL = "org.opencontainers.image.version";

export const HEALTH_ROUTE_FILE = "src/http/register-get-health.ts";

export const HEALTHY_HANDLER = 'async () => ({ status: "ok" })';

export const FAILING_HANDLER =
  'async (_request, reply) => reply.code(500).send({ status: "down" })';

export const DEFAULT_RELEASE_SOURCE_PORT = "18443";

export const DEFAULT_REGISTRY_PORT = "5000";

export const DOCKER_SOCKET_PATH = "/var/run/docker.sock";

export const RELEASE_SOURCE_FOLDER = "../../artifacts/release-source";

export const CERTIFICATE_SCRIPT = "../../../scripts/e2e-release-certificate.mjs";

export const INSTALL_WEB_PORT = "18080";
