# 0016. Local authentication model: passwords, sessions, registration and recovery

- **Status:** Proposed

## Context

Offgrid runs as a self-hosted server on a home network. Several people share one instance, and each person has private data and shared family data. Today the identity module is a stub and every request is anonymous (see [docs/architecture/overview.md](../architecture/overview.md)). Every issue in the user and auth milestone depends on one agreed model for signing up, signing in, staying signed in and recovering access, so it is decided here before the code is written.

The design atlas describes a zero-knowledge "master passphrase" model, in which the server never holds a key that can read user data. The architecture assumes a trusted local server. The MVP takes the second path. End-to-end keys would make recovery impossible without the passphrase, would need a client-side key store on every device, and would not help a household that runs its own server. This is deferred, and recorded in the deferred list below.

Constraints that shape the choice:

- The server runs on small hardware, such as a Raspberry Pi, so password hashing must be tunable and sessions cheap to check.
- Nothing may leave the local network. Breach-password lookups over the internet are not allowed, so the list of common passwords is local.
- Access control is never feature-gated (see [CLAUDE.md](../../CLAUDE.md)), so auth cannot depend on optional settings.
- Sign-in must still work when outgoing mail is not configured, so no step may depend on mail.
- The server validates all input with zod, and it never logs passwords, codes or tokens (see [.claude/rules/security-privacy.md](../../.claude/rules/security-privacy.md)).

## Decision

We will use local accounts with passwords, opaque sessions stored on the server, and recovery codes. Email is optional.

**Password storage and rules**

- We will hash passwords with Argon2id. The starting parameters are the OWASP minimums (19 MiB memory, 2 iterations, parallelism 1). The parameters are configuration, validated with zod, so an operator can raise or lower them for the hardware. Each hash stores its own parameters, so a change applies to new hashes and existing ones are rehashed on the next successful sign-in.
- Passwords are at least 12 characters and at most 128. We will reject any password that appears in a list of very common passwords bundled with the server. We will not query an online breach service, since that would be an outbound call.
- We will not force periodic rotation. Passwords change on request, after an admin reset, or after a recovery.

**Sessions**

- Sign-in issues a short-lived access token (15 minutes) and a refresh token. The web app renews the access token silently with the refresh token.
- Refresh tokens are random, at least 256 bits, and stored only as a hash. Each refresh rotates the token. Reuse of a rotated token revokes the whole session family.
- Each session is a database row. Revoking a session deletes its row, so "sign out", "sign out everywhere else" and "session ended elsewhere" all take effect at once. We will not use self-contained JWTs, because they cannot be revoked before they expire.
- "Remember me" lengthens the refresh token's lifetime from 12 hours to 30 days, as in the design. Without it, the refresh token lasts 12 hours from sign-in and is not extended by renewals.
- Each session records a device label and last-used time, so the account page can list devices.

**Registration**

- Registration is open while the instance setting allows it. Anyone who can reach the server can open the sign-up page and create an account, as the design describes.
- The first account created on a new instance becomes the instance admin. We will claim this in the same transaction that creates the account, so two simultaneous first sign-ups cannot both become admin. Every later account is a regular user.
- The admin can close registration. A closed registration refuses new accounts, and the admin can reopen it.

**Account identifier**

- An account has an email address, unique ignoring case, and a display name.
- The email is not verified unless outgoing mail is configured. When mail is configured, verification is not required for sign-in in the MVP, so a typo cannot lock someone out of their own server. Email verification is deferred.

**Recovery**

- At sign-up, the server shows a one-time recovery code of 128 bits and asks the person to store it. The server keeps only a hash. The code can be used once to reset the password, and it is replaced after each use.
- If the owner has configured outgoing mail, a one-time emailed code is also offered. It expires after 10 minutes and works once. Without configured mail, the option is hidden, not shown as broken.
- An admin can reset another person's password. The reset sets a temporary password that the person must change at sign-in, and it revokes that person's sessions.
- The last resort is a server-side command, run by someone with access to the host, that sets a password. It is documented and is not reachable over HTTP.

**Family context**

- A session identifies the user, not a family. A user can belong to several families, and the server resolves the current memberships on every request.
- The client names the family it acts in with each request. The server accepts that family only if the user is a current member when the request is made. A removed member loses access on the next request, without signing out.

**Abuse protection**

- Sign-in, refresh, recovery and registration endpoints are rate limited per client address and per account.
- An account is locked for 15 minutes after 10 failed sign-ins within 15 minutes. The lock is temporary, and an admin can clear it. Because the lock is per account and not per instance, guessing against one name cannot lock out the rest of the household. Per-client limits also apply, so one machine cannot spread guesses across many accounts.
- Error messages are the same whether an email has an account or not, and whether the password or the account was wrong. A disabled account gets the same message as a wrong password, so the message does not reveal the account state. The admin sees the state in the admin screens.
- The sign-up response for an email that already exists is the same generic failure as any other sign-up error. This reveals nothing to a stranger on the network, at the cost of a less helpful message for a person who forgot they already have an account.

**Deferred**

Biometrics, passkeys, two-factor authentication, SMS, multisig or family recovery contacts, an audit log, usernames such as "Aether ID", email verification, and end-to-end or zero-knowledge keys. Later milestones pick these up as new records.

## Alternatives considered

- **Zero-knowledge master passphrase, as in the design.** It protects data even from the server operator, but a lost passphrase means lost data, the server cannot help with recovery, and every client needs key management. Rejected for the MVP and deferred.
- **Stateless JWT sessions.** They need no database lookup, but a stolen token stays valid until it expires, and "sign out everywhere" cannot work without a revocation list. Rejected, since revocation is a stated requirement.
- **Email as the only recovery path.** It is simple, but it fails on a server with no mail configured, which is the common home case. Rejected as the only path; kept as an option.
- **Verified email required at sign-up.** It adds a mail dependency to the first run and can lock a household out of its own server. Rejected for the MVP.
- **Usernames instead of email.** Rejected because the design asks for email plus display name, and it would make the admin's reset workflow harder to follow.

## Consequences

- The server can read nothing that a password or recovery code protects, but it can read the data itself. Anyone with access to the database and the server's secrets can read family data. This is the trusted-server model the architecture already assumes, and it is stated in the privacy notes when sign-in ships.
- A forgotten password with no recovery code and no configured mail can only be fixed by an admin or by the host command. The sign-up flow must make the recovery code hard to skip.
- Argon2id costs memory and time on small hardware. The parameters are configuration, and the performance check for the Raspberry Pi target belongs to the identity implementation issue.
- Revocation and rate limits need state in the database. This is a small cost, and it keeps the auth path simple.
- Accounts are per instance. Nothing here assumes a cloud account, so a later cloud feature must add its own identity model in a new record.
- Issues in the milestone should follow this record: OG-46 (identity module), OG-47 (register), OG-48 (sign-in and sign-out), OG-49 (auth middleware), OG-50 (admin API and command), OG-51 (account API), OG-53 (mail setup), OG-54 (recovery API), OG-52 (notifications). Each of those issues is traceable to a decision above.
- No doc is contradicted by this decision. [docs/privacy.md](../privacy.md) and the architecture overview describe the current sign-in stub, and they are updated when sign-in ships.
