# 0018. Outgoing mail to a provider the owner chooses

- **Status:** Proposed

## Context

[ADR 0016](0016-local-authentication-model.md) allows outgoing mail only to an SMTP relay on the local network, and the server refuses any other address. A home server usually cannot send mail on its own, because home connections are often blocked, so the owner needs an outgoing mail account. Most owners cannot find server addresses and ports, and they can reach a mail provider only with an app password, which is a separate password that a provider issues for one application.

[OG-53](https://linear.app/offgridos/issue/OG-53/email-delivery-owner-friendly-mail-setup) asks for setup in about two minutes with an email address and an app password, with provider presets for Gmail, iCloud and Fastmail. Those servers are on the public internet, so the LAN-only rule cannot hold for them.

Email is optional. Sign-in and every other feature must work without it.

## Decision

- We will let the admin send mail through a provider preset (Gmail, iCloud or Fastmail) or through a custom server. For a preset the owner enters an email address and an app password, and the server fills in the server address, port and security. The custom option asks for all server details. The server no longer checks that a custom server is on the local network.
- We will not offer Outlook.com yet. Microsoft is moving SMTP to OAuth 2.0, and app passwords may stop working for personal accounts. The preset is added when OAuth 2.0 is supported.
- The mail password is encrypted with AES-256-GCM. The key comes from the Docker secret `mail-encryption-key`, which `secrets-init` creates. The server refuses to start without a 32-byte key. The API never returns the password, and no log line contains it.
- Mail stays off until the admin saves settings. The server connects only to the server the admin saved, and only when it sends a message. There is no telemetry.
- Mail carries four kinds of message: the emailed recovery code ([OG-54](https://linear.app/offgridos/issue/OG-54)), the admin's test message, and notification emails for a password change and a regenerated recovery code. Every recipient is a registered account on the instance.
- Delivery runs in the background and does not block the action that caused it. A failed send is retried after 30 seconds, 2 minutes and 10 minutes. Retries are kept in memory, so a restart drops pending retries. A durable retry queue is follow-up work.
- [ADR 0016](0016-local-authentication-model.md)'s LAN-only rule for outgoing mail is superseded by this record. Its other parts still apply. The no-outbound-calls rule in CLAUDE.md, the security rule and the privacy statement are amended in the same change.

## Consequences

- Easier: an owner can connect Gmail, iCloud or Fastmail in two values, and recovery codes can be emailed.
- Harder: with a public provider, mail content leaves the machine for that provider. The privacy statement says so, and mail stays off by default. The provider presets must be checked against provider documentation when they change.
- Harder: the `instance` ownership scope in [ADR 0017](0017-shared-database-roles-and-prisma-migrate.md) means "no personal data". The mail settings row holds the admin's mail address and username, which are personal data. The row is kept in the `instance` scope for now, and ADR 0017 needs a follow-up change to allow an instance's own mail account.
- Harder: retries are lost on restart, so a notification email can be missed if the server restarts during a retry window. The in-app inbox still holds every notification.
