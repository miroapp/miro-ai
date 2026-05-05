---
name: miro-comments
description: Use when the user wants to read, triage, reply to, resolve, or close out comment threads on a Miro board — addressing reviewer feedback after a code review, grooming unresolved threads, or replying to specific comments on widgets, documents, diagrams, or table rows.
---

# Triage and Respond to Miro Board Comments

Read comment threads from a Miro board, triage open feedback, post replies, and mark threads resolved.

## When to use this skill

- The user wants to **address feedback** left as comments on a Miro board (often after a `miro-code-review` board has been shared with reviewers).
- The user wants to **triage open / unresolved threads** on a board: who said what, what still needs a reply.
- The user wants to **reply** to a specific comment thread.
- The user wants to **resolve / close out** (or reopen) a thread.

## Inputs

Identify from the user's request:
1. **board-url** (required): Miro board URL.
2. **item-url** (optional): URL with `moveToWidget=...` or `focusWidget=...` to scope to comments on a single widget (document, diagram, table, sticky, image, etc.).
3. **scope filters** (optional): `resolved=false` for open threads only, date range, pagination.

If the board URL is missing, ask for it.

## Available tools

| Tool | Purpose |
|------|---------|
| `comment_list_comments` | Page through threads on a board or single item. Filters: `resolved`, `from_date`, `to_date`, `limit` (1–50), `offset`. |
| `comment_reply` | Append a reply message to a thread (1–2000 chars, plain text, attributed to the current user). |
| `comment_resolve` | Set `resolved=true` (mark addressed) or `resolved=false` (reopen) on a thread. |

## Workflow

### Triage open feedback (default for "address comments / feedback")

1. Call `comment_list_comments` with `resolved=false` and the board (or item) URL. Use `limit=50` and **page with `offset` until the response is exhausted** (i.e. fewer items returned than `limit`, or `offset + len(data) >= total`) before summarising — boards can have hundreds of threads.
2. Group results to give the user a scannable picture:
   - By **author** (who is asking what).
   - By **position type** — `canvas` (free-floating), `attached` (on a widget — show the `itemId`), `table` (data-table row, includes `rowId`), `doc` (on a document item).
   - By **age** (oldest first if more than ~10).
3. Summarise each thread: original message + key follow-ups. Note unresolved questions distinctly from suggestions.
4. For each thread, propose one of:
   - **Reply** with a draft response — when the comment asks a question or requests a change you can answer.
   - **Resolve** — when the comment is already addressed in the underlying content (e.g. a doc edit landed) or the reviewer has accepted.
   - **Skip** — when human judgement is needed; surface it for the user.
5. Replying does **not** resolve a thread — call `comment_resolve` separately when the thread is addressed.
6. Confirm with the user before sending replies or resolving in bulk. Apply the approved actions.

### Reply to a single thread

1. If the user only has the comment text or author, call `comment_list_comments` first to find the matching thread ID.
2. Call `comment_reply` with `comment_id` and the reply content.
3. Confirm posting and offer to resolve the thread.

### Resolve / reopen

1. Use `comment_list_comments` to confirm the `comment_id`.
2. Call `comment_resolve` with `resolved=true` (or `false` to reopen).

### Comments on a specific item

When the user provides a URL like `https://miro.com/app/board/abc=/?moveToWidget=3458764612345`, pass the full URL (query string included) to `comment_list_comments`; the tool scopes to threads attached to that single item (any widget type — document, diagram, table, sticky, image, etc.).

## Position types

| Type | Meaning | Extra fields |
|------|---------|--------------|
| `canvas` | Free-standing thread placed on the board | `x`, `y` |
| `attached` | Thread attached to a widget (sticky, shape, image, diagram, code, prototype, etc.) | `itemId`, `x`, `y` |
| `table` | Thread on a row inside a data table | `itemId` (table), `rowId` |
| `doc` | Thread on a document item (doc-level only, see Limits) | `itemId` |

## Limits

- **Read / reply / resolve only** — no tool to *create* a new thread, *edit* a message, or *delete* a message or thread.
- **No reaction management** — emoji reactions are returned in the data but cannot be added or removed.
- **Document threads are doc-level only** — threads anchored to a Miro Doc as a whole are first-class; comments anchored to a specific paragraph inside the doc may not appear with full inline context.
- **Plain text replies only** — 1–2000 chars, no Markdown, no attachments. `@mentions` typed in the text are not guaranteed to resolve to users.
- **Replies are flat** — appended to the thread in order; no nested sub-threads.
- **No notification control** — replies trigger Miro's default notifications to thread subscribers; cannot be suppressed or @-targeted from this skill.
- **No keyword search / no server-side author filter** — filter client-side after listing. Pagination is offset-based, max 50 per page.

## Examples

**User input:** `address the feedback on https://miro.com/app/board/abc=`

**Action:** Run the triage workflow — list unresolved threads (paging through all of them), group by author + position, summarise, propose reply/resolve/skip per thread, confirm, apply.

---

**User input:** `reply "Fixed in commit abc123" to the comment from Alice on https://miro.com/app/board/abc=`

**Action:** List comments, find Alice's most-recent open thread, post reply, offer to resolve.

---

**User input:** `what's still unresolved on https://miro.com/app/board/abc=/?moveToWidget=3458764612345`

**Action:** List unresolved comments scoped to that single widget; summarise threads grouped by author.

---

**User input:** `resolve all my comments on https://miro.com/app/board/abc=`

**Action:** Identify the current user (ask if unknown). List unresolved threads, filter client-side by `createdBy` matching the user, present them, confirm, then call `comment_resolve` on each.

## Composing with other skills

- After running `miro-code-review` and sharing the board for review, this skill closes the loop: read what reviewers wrote and respond.
- Pair with `miro-browse` / `context_get` to fetch the underlying widget context when a thread refers to "this diagram" or "this row" — pass the comment's `itemId` to the relevant read tool to ground the reply.
