# 0016. Local authentication model: passwords, sessions, registration and recovery

- **Status:** Proposed

## Context

Offgrid runs as a self-hosted server on a home network. Several people share one instance, and each person has private data and shared family data. Today the identity module is a stub and every request is anonymous (see [docs/architecture/overview.md](../architecture/overview.md)). Every issue in the user and auth milestone depends on one agreed model for signing up, signing in, staying signed in and recovering access, so it is decided here before the code is written.

The design atlas and architecture handoff linked from OG-45 describe a zero-knowledge "master passphrase" model, in which the server never holds a key that can read user data. The architecture assumes a trusted local server. The MVP takes the second path. End-to-end keys would make recovery impossible without the passphrase, would need client-side key management on every device, and would not help a household that runs its own server. This is deferred.

Constraints that shape the choice:

- The server runs on small hardware, such as a Raspberry Pi, so password hashing must be tunable and sessions cheap to check.
- Nothing leaves the local network, except outgoing mail: to an operator-configured relay on the LAN in local mode, and through AWS SES in cloud deployments (see Decision). Breach-password lookups over the internet are not allowed, so the list of common passwords is local.
- Access control is never feature-gated (see [CLAUDE.md](../../CLAUDE.md)), so auth cannot depend on optional settings.
- Sign-in must still work when outgoing mail is not configured, so no step may depend on mail.
- The server validates all input with zod, and it never logs passwords, codes or tokens (see [.claude/rules/security-privacy.md](../../.claude/rules/security-privacy.md)).

Options considered:

- **Zero-knowledge master passphrase, as in the design.** It protects data even from the server operator, but a lost passphrase means lost data, the server cannot help with recovery, and every client needs key management. Rejected for the MVP and deferred.
- **Stateless JWT sessions.** They need no database lookup, but a stolen token stays valid until it expires, and "sign out everywhere" cannot work without a revocation list. Rejected, since revocation is a stated requirement.
- **Email as the only recovery path.** It fails on a server with no mail configured, which is the common home case. Rejected as the only path; the recovery code is always available.
- **Verified email required at sign-up.** It adds a mail dependency to the first run and can lock a household out of its own server. Rejected for the MVP.
- **Usernames instead of email.** Rejected because the design asks for email plus display name.

## Decision

We will use local accounts with passwords, opaque sessions stored on the server, and recovery codes. Email is optional and is never used for sign-in.

**Outgoing mail (an exception to the no-outbound-calls rule)**

- Mail goes through one transport interface, and the deployment picks the adapter by config. In local mode the adapter is an SMTP relay that the owner configures. The relay address must be on the local network: a private address (RFC 1918 or the IPv6 unique-local range), or a name that resolves to one. The server validates this with zod and refuses to start local mail with any other address.
- In cloud deployments the adapter is AWS SES. The cloud is not local mode, so this adapter is the one outbound call allowed beyond the LAN relay. Its credentials are secrets, loaded from Docker secrets or files, never from environment defaults (see [.claude/rules/security-privacy.md](../../.claude/rules/security-privacy.md)). The cloud adapter is outside the MVP scope of this record. Its interface must not need changes when it ships.
- Mail is off by default. With mail off, the emailed recovery path and the mail setup screens are hidden, not shown as broken.
- Mail carries only the emailed reset code and the admin's test message. It is never sent to an address that is not registered on the instance.
- This exception narrows the MVP statement in [ADR 0003](0003-built-in-tunnel-deferred.md) ("no outbound network calls") for mail only. ADR 0003 is Accepted and cannot be edited, so the narrowing is recorded here. The no-outbound-calls rule in CLAUDE.md, the security rule and the privacy statement are amended in the same change.

**Email addresses**

- An account has an email address, unique ignoring case, and a display name.
- Email is not verified in the MVP, with no exceptions. Sign-up does not send a confirmation, and an address is not checked for ownership. The consequence is listed below.

**Password storage and rules**

- We will hash passwords with Argon2id. The starting parameters are the OWASP minimums (19 MiB memory, 2 iterations, parallelism 1). The zod schema rejects any configured value below those minimums, so a weakened configuration fails fast at startup. Each hash stores its own parameters, so a raised setting applies to new hashes, and existing hashes are rehashed on the next successful sign-in.
- The Argon2id library is chosen in OG-46. It must install on arm64 Linux, either from a prebuilt binary or through a WebAssembly fallback. The Raspberry Pi timing check is part of OG-46.
- Passwords are normalised with Unicode NFKC before any check. After normalisation a password is 12 to 128 characters, so the maximum bounds the hashing cost. The password is rejected if it is on the bundled list of very common passwords, or if it contains the account's email local part or display name, ignoring case.
- We will not force periodic rotation. Passwords change on request, after an admin reset, or after a recovery.

**Sessions**

- A session is one database row, created at sign-in. The row holds the hash of the current refresh token, the device label and the last-used time.
- Sign-in issues a short-lived access token (15 minutes) and the refresh token. The web app renews the access token silently with the refresh token.
- Refresh tokens are random, at least 256 bits, and stored only as a hash. Each refresh replaces the stored hash in the same row, so rotation never creates a second row.
- If a rotated-out token is presented again, the server revokes the session row and the browser must sign in again. A 30-second grace window accepts the immediately previous token, so two tabs refreshing at once do not sign the person out.
- Session lifetime is absolute and is not extended by rotation: 12 hours from sign-in, or 30 days with "remember me". When it ends, the person signs in again.
- Revoking a session deletes its row. "Sign out", "sign out everywhere else" and "session ended elsewhere" all take effect at once. We will not use self-contained JWTs, because they cannot be revoked before they expire.
- The refresh token is sent in an `HttpOnly`, `SameSite=Strict` cookie with path `/api/auth`. The cookie carries `Secure` whenever the request arrives over HTTPS. Over plain HTTP, browsers drop a `Secure` cookie, so on the LAN the cookie is not `Secure`, and the token crosses the network unencrypted. This is the accepted risk below.
- Refresh and sign-out require a custom request header that a cross-site form cannot send. CORS allows credentials only for the configured web origins, never a wildcard.

**Transport (accepted risk)**

- Plain HTTP on the LAN is accepted for the MVP as a documented risk. Passwords, refresh tokens and recovery codes can be read by anyone who can see the network traffic. [docs/privacy.md](../privacy.md) states this. HTTPS, with a self-signed or operator-provided certificate, is deferred to a later record.

**Registration**

- Registration is open by default on a new instance. The setting lives in the instance settings row, and the admin can close it. A closed registration refuses new accounts, and the admin can reopen it. Registration can be closed only by an admin, and an admin exists once the first account is created, so the switch is always reachable.
- The first account created on a new instance becomes the instance admin. We will claim this in the same transaction that creates the account, with a unique constraint, so two simultaneous first sign-ups cannot both become admin. Every later account is a regular user.
- First-run window (accepted risk): until the first account exists, anyone who can reach the server can become admin. The install guide tells the owner to create the first account immediately after installing.
- Sign-up is rate limited per client address, as sign-in is.

**Recovery**

- At sign-up, the server shows a one-time recovery code of 128 bits and asks the person to store it. The server keeps only a hash. The code resets the password once. A new recovery code replaces it, and it is shown once in the response to the reset, never logged.
- If the owner has configured mail, a one-time emailed code is also offered. It is 8 random digits, stored hashed, valid for 10 minutes, and accepts at most 5 wrong entries. Only one emailed code is active per account at a time, and requests for a new code are rate limited.
- Every password change, including recovery and the emailed code, revokes all of that person's other sessions.
- An admin can reset another person's password. The reset sets a temporary password, shown once on the admin screen, valid for 24 hours, single use, and required to change at the next sign-in. It revokes that person's sessions. It is never logged.
- The last resort is a server-side command, run by someone with access to the host. It is documented in the install guide, which OG-50 creates.

**Admin actions**

Instance admins only: view users, disable and enable an account, reset a password, clear an account lock, and switch registration. Disabling an account revokes its sessions. A disabled account is refused at sign-in with the same generic message as a wrong password, so the message does not reveal the account state. The admin sees the state in the admin screens.

**Family context**

- A session identifies the user, not a family. A user can belong to several families.
- The client names the family it acts in with each request. The server accepts that family only if the user is a current member.
- Identity does not read family tables. The family module publishes membership events under [ADR 0013](0013-projections-for-other-modules-only.md) and [ADR 0002](0002-outbox-events-and-projections.md), and identity keeps a read-only projection of current memberships. The projection lags the family module by a few seconds on a local server. A removed member keeps access until the projection catches up, then loses it on the next request, without signing out.

**Abuse protection**

- Sign-in, refresh, recovery and sign-up endpoints are rate limited first per client address, before any account is looked up. Client addresses are held in memory for the window only, and are never written to the database or logs.
- A per-account counter is kept for every submitted email, including emails that have no account. After 10 failed sign-ins within 15 minutes, that email is locked for 15 minutes.
- A locked email gets the same response whether or not an account exists: the same status, body and timing. This prevents the lock from revealing which emails exist.
- Sign-in with a wrong password, an unknown email, or a disabled account returns the same generic message. For an unknown email, the server still runs an Argon2id verification against a fixed dummy hash, so timing does not reveal the account either.
- An admin can clear a lock.

**Retention of personal data**

- Device labels and last-used times are kept while the session exists. They are deleted when the session ends or the account is deleted.
- Client addresses are not stored; see Abuse protection.

**Data ownership**

- Credentials, sessions, recovery codes, emailed codes and sign-in attempts are rows owned by one user, so they use the **user** scope of [ADR 0009](0009-table-ownership-scopes.md).
- The instance settings row and the first-admin claim belong to the instance, not to a user or family. They are a single row with a constant key and a unique constraint, and they have no owner column. ADR 0009 defines no scope for this. OG-46 proposes the addition to ADR 0009 before its code merges.

**Events**

- Identity publishes `user-created-v1`, `user-disabled-v1` and `user-deleted-v1`, named under the convention in `.claude/rules/events.md`. Their payloads carry the user id and display name only, never the email. OG-46 defines them in `packages/contracts`.

**Deferred**

Biometrics, passkeys, two-factor authentication, SMS, multisig or family recovery contacts, an audit log, usernames, email verification, HTTPS on the LAN, and end-to-end or zero-knowledge keys. Later milestones pick these up as new records.

## Consequences

- The server stores only hashes of passwords, recovery codes and refresh tokens. It holds the family data itself in readable form, so anyone with access to the database and the server's secrets can read it. This is the trusted-server model the architecture already assumes.
- A forgotten password, with no recovery code and no configured mail, can only be fixed by an admin or by the host command.
- Anyone who knows an email address can lock that person's account for 15 minutes with 10 wrong sign-ins. The lock cannot be avoided without revealing which accounts exist. We accept this trade-off, and an admin can clear the lock early.
- Email is unverified. Anyone can register with an address they do not own, and the owner of that address can then receive that account's emailed reset codes. Reset codes go only to the registered address, so this does not let a stranger take over an existing account.
- Plain HTTP on the LAN exposes passwords and tokens to anyone on the same network segment. This is the accepted risk above, and it is documented for owners.
- The mail exception allows the server to make one kind of outbound connection, to a LAN relay the owner configures. It narrows ADR 0003's MVP statement and the no-outbound-calls rule, as described above.
- Argon2id costs memory and time on small hardware. The parameters are configuration, and the Raspberry Pi check belongs to OG-46.
- Sessions, the family projection and rate limits need state. This is a small cost, and it keeps the auth path simple.
- Accounts are per instance. Nothing here assumes a cloud account, so a later cloud feature must add its own identity record.
- The milestone issues OG-46 to OG-54 implement this record. Each cites it in its pull request. The ADR 0009 scope addition for instance settings is open until OG-46 proposes it.
- Docs describing the current sign-in stub, including [docs/privacy.md](../privacy.md) and the architecture overview, are updated when sign-in ships.
