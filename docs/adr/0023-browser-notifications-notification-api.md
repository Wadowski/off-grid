# 0023. Browser notifications use the Notification API

- **Status:** Proposed

## Context

[OG-89](https://linear.app/offgridos/issue/OG-89/generic-notification-core-with-pluggable-channels) adds a browser channel to the notifications core. The architecture handoff names two options: web push and the Notification API.

Web push sends each message through the push service of the browser vendor (Google, Mozilla, Apple). The server must make outbound network calls for every message, and the browser must reach a vendor service. CLAUDE.md forbids outbound calls in local mode, apart from mail to a server the owner configures ([ADR 0018](0018-outgoing-mail-to-a-chosen-provider.md)).

The Notification API shows a notification from the page the person already has open. The server makes no outbound call. It needs the permission the browser grants once per origin.

The handoff also asks for a push path for reminders that does not depend on the tunnel. Mobile operating systems restrict background connections, so mobile push is a separate channel that comes later. The channel interface in OG-89 must accept it without changing callers.

## Decision

- We will use the Notification API for the browser channel. The web app asks the person for permission, and it shows a browser notification only while permission is `granted`.
- We will not use web push or a service worker for this channel. Vendor push services would receive message metadata, which breaks the no-outbound-calls rule.
- The browser channel shows notifications only while a tab on the instance is open. A notification sent while no tab is open waits in the inbox, and the inbox is the record of truth.
- Mobile push is a later channel that implements the same channel interface. It is not part of OG-89, and it will need its own decision record because it reaches a vendor service.

## Consequences

- Easier: no outbound call and no vendor account, so the local-first rule holds.
- Harder: a person who has no open tab does not see a browser notification. The inbox and the mobile channel cover that case later.
- Follow-up: [OG-90](https://linear.app/offgridos/issue/OG-90) (event reminders) depends on the mobile push path, which needs its own ADR before it is built.
