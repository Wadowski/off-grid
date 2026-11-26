# 0044. The web app allows a cross-owner move after an explicit confirmation

- **Status:** Accepted

## Context

[0037](0037-cross-owner-move-copy-and-removal.md) makes a move to a drive of another owner a copy of the subtree, followed by the removal of the source, and the server answers with `crossOwnerNotice: true`. [0034](0034-files-access-model-trash-and-versions.md) section 8 allows the same move with a notice. [OG-136](https://linear.app/offgridos/issue/OG-136) adds the move dialog to the web app, so the UI must decide how to present that move.

A person choosing another owner's drive may not expect that the file is copied, that the new copy has new ids, and that the original is removed without going to trash. A silent move would surprise them, and refusing the move in the UI would force a manual download and upload that the server can do in one step.

## Decision

- The web app offers every drive the person may use as a move target, including drives of another owner. Those drives carry the caption "Other owner".
- Choosing a target of another owner does not move the entry at once. The first press of Move shows the line "This copies it to the other drive and removes the original." and changes the button to "Move anyway". The second press calls the API. Changing the target clears the confirmation.
- A move that completes with `crossOwnerNotice: true` tells the person that the entry was copied to the target and removed here.
- The server is unchanged. This record amends 0037 and 0034 for the web app only: the server rules stand, and the UI adds the confirmation.

We chose this because it keeps the one request that the server supports, and it makes the copy visible before it happens. Rejected alternatives: refusing cross-owner targets in the UI, which contradicts 0037 and forces a download and upload; moving without confirmation, which copies and removes data without warning.

## Consequences

- Easier: one request performs the move, and the person decides with the consequence in view.
- Harder: the dialog keeps a confirmation state, and the copy text must stay in step with the server's behaviour.
- Known limits: the confirmation is shown per move; a person who moves many entries to another owner confirms each one.
- Reversing this decision means a new ADR.
