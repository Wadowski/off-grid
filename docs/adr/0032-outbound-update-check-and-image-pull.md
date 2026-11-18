# 0032. Outbound update check and image pull, with a separate updater and a module that owns updates

- **Status:** Proposed

## Context

Offgrid runs as Docker containers on the owner's host. Updating means pulling new images and restarting services. Today the system has no way to learn that a release exists, and no way to fetch one. [OG-162](https://linear.app/offgridos/issue/OG-162/adr-outbound-update-check-image-pull-updater-trust-and-owning-module) asks for the decisions that the system update work needs before code is written.

This is the first outbound exception that is neither mail ([ADR 0018](0018-outgoing-mail-to-a-chosen-provider.md)) nor web push ([ADR 0024](0024-browser-notifications-web-push.md)). The no-outbound-calls rule in CLAUDE.md, [ADR 0003](0003-built-in-tunnel-deferred.md) and the privacy statement all forbid it today, so the exception must be recorded here first.

The forces are these:

- **Narrow network use.** Every outbound call must be visible to the owner and must happen only when the owner asks for it or has turned on a clearly named option.
- **Privilege.** Applying an update needs access to the Docker daemon, through the Docker socket. Access to that socket is equivalent to root on the host. A server that reads untrusted input, such as a release manifest, should not hold that access.
- **Module boundaries.** CLAUDE.md requires that a module touch only its own Postgres schema and talk to other modules through events and contracts. The update feature needs admin settings and an API, which belong to a module. The part that touches Docker does not touch any module schema, so it is not a module.
- **Trust in what is pulled.** A tag such as `latest` can move. An image that the owner pulls must be the one the release pipeline built.
- **Ownership of the release source.** The release source is GitHub Releases for the manifest and GitHub Container Registry (GHCR) for images. The owner chose both on 2026-11-17.

## Decision

### Outbound calls

- We will allow the system to make outbound calls for updates in exactly two cases:
  1. when an admin clicks **Check for updates** or **Update**;
  2. when the admin has turned on the **nightly automatic update**. This option is off by default. When it is on, the check runs once a day in the lowest-traffic hour, which the admin can see and change in the settings.
- No other outbound call is added. The update feature makes no call at any other time, and no call carries app data, user data or identifiers beyond what the HTTP request needs.
- The exact hosts are:
  - `api.github.com`: the GitHub Releases API, which returns the release list and the signed release manifest.
  - `ghcr.io`: the GitHub Container Registry, which serves image manifests.
  - `pkg-containers.githubusercontent.com`: the host to which GHCR redirects image layer downloads. The implementation must confirm this host against GHCR's current behaviour before it is added to any allow-list.
  - `release-assets.githubusercontent.com`: the host to which the GitHub Releases API redirects the download of the release manifest asset. Observed on 2026-11-18 for a public release asset (`api.github.com` answered with a 302 to this host); the updater follows that one redirect and no other.
- All calls use HTTPS. The server does not follow redirects to any host outside this list.

### Owning module and the updater

- The update API and the admin settings live in a new `system` module at `modules/system`, created with the `new-module` skill. The module owns its own schema and holds the update settings and the record of update runs.
- The updater is an app at `apps/updater`, not a module. It is the only container that mounts the Docker socket. It holds no module schema, and it reads its instructions only from the `system` module's events and from the release manifest it verifies.
- The server never mounts the Docker socket. The `system` module asks the updater to act through a versioned event, using the outbox pattern in [ADR 0002](0002-outbox-events-and-projections.md) and [ADR 0010](0010-pluggable-event-transport.md) as the transport for events.

### Trust

- The release pipeline records the digest of each image in the release manifest. The updater pulls each image by that digest, never by tag. A pulled image whose digest does not match the manifest is refused.
- The manifest is fetched over HTTPS from the GitHub Releases API. The updater checks the digests in the manifest against the images it pulls.
- We will not sign the manifest in this version. Digest pinning and HTTPS are the trust mechanism. Signing of the manifest, for example with Sigstore or a key pinned in the updater, is deferred to a later decision record. Until that record exists, the update feature must not describe its trust as signed.

### Failure policy

- Before an update starts, the updater takes a backup. The backup and rollback rules are detailed in the backup and updater work, and this record does not restate them. If the backup fails, the update does not start.
- A failed update leaves the previous images in place, and the admin sees the failure in the update history.
- Once the database is changed, a failed migrate, replace or health step triggers a rollback. The rollback stops both containers, restores the database from the backup taken in this run, and starts the previous images by their recorded references. The restore discards every write made after the backup, and the update history records that loss. If any rollback step fails, the update ends in a state that needs an admin, and the system does not retry the destructive steps.

### Release pipeline

`.github/workflows/release.yml` runs when a `vX.Y.Z` tag is pushed. It refuses a tag that is not on `main`, a version below `MINIMUM_UPDATE_FROM`, and a tag that already has a release. It builds the `runtime` target of the server and web Dockerfiles for `linux/amd64` and `linux/arm64`, and pushes them to `ghcr.io/<owner>/offgrid-main-server` and `ghcr.io/<owner>/offgrid-main-web` with the tags `X.Y.Z` and `X.Y`. It never pushes `latest`. Provenance and SBOM attestations are off, so the digest that the manifest records is the digest of the multi-platform image index.

`scripts/release-manifest.mjs` writes `release-manifest.json` with the fields `schemaVersion`, `version`, `commit`, `images.server` and `images.web` (each with a digest `reference` and `platforms`), and `minimumPreviousVersion`. The generator reads `minimumPreviousVersion` from the root file `MINIMUM_UPDATE_FROM` and validates the result with `releaseManifestSchema` from `packages/contracts`, the same schema the updater uses. The workflow attaches the manifest to the GitHub Release. The manifest is not signed.

### Documents amended in the same change

This record is an exception to the no-outbound-calls rule, so the following are amended in the same change, as [ADR 0018](0018-outgoing-mail-to-a-chosen-provider.md) did for mail:

- CLAUDE.md, in the non-negotiable on outbound calls: the exceptions list gains update checks and image pulls, limited to the two cases above.
- [docs/privacy.md](../privacy.md): the runtime statement gains the update exception and lists the hosts.
- [docs/privacy-guards.md](../privacy-guards.md): the egress-blocked stack check still asserts that the stack cannot reach the internet. The update exception does not change that check, because the check runs with the update feature off.

## Consequences

- Easier: the owner can see every outbound host and the two triggers for each. An update cannot run unless the admin asks for it or has turned on the nightly option.
- Easier: a compromised server does not hold the Docker socket, so it cannot start containers or read the host filesystem through Docker.
- Harder: the updater is a second service to build, secure and test. It needs its own container, its own image and its own tests.
- Harder: without manifest signing, a compromised GitHub account or a compromised release pipeline can publish an image and a matching manifest. Digest pinning protects against a moved tag and a tampered image, but not against a fully controlled release. The privacy statement and the admin's settings must not claim more than this.
- Harder: the owner's network must allow the three hosts. A host that blocks them disables update checks, and the system must say so rather than fail silently.
- Follow-up: the release pipeline must publish the manifest and its digests. Its record is needed before this decision moves to Accepted.
- Follow-up: manifest signing is deferred and needs its own record.
- Follow-up: cloud deployment update policy is a separate decision and is not covered here.
- Status moves to Accepted when the release pipeline and the updater are merged.
