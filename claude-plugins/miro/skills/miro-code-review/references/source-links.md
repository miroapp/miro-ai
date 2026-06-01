# Determining the source-link base URL

Detail for §2 "Determine the source-link base URL". Capture once and reuse for every file reference in §5 (table cells, document bullets, diagram labels). Pin links to the head SHA so they survive force-pushes.

Record:

- `LINK_HOST` — host from §1 (e.g. `github.com`, `gitlab.com`, self-hosted)
- `LINK_OWNER` / `LINK_REPO` (GitHub-style) **or** `LINK_GROUP` / `LINK_PROJECT` (GitLab-style)
- `LINK_SHA` — PR/MR head commit SHA, fetched per platform:

```bash
# GitHub
LINK_SHA=$(gh pr view $PR_NUMBER --json headRefOid -q .headRefOid)
# external repo: add --repo $OWNER/$REPO

# GitLab
LINK_SHA=$(glab mr view $MR_NUMBER -F json | jq -r '.diff_refs.head_sha // .sha')
# external project: add -R $GROUP/$PROJECT

# Local diff or branch comparison
LINK_SHA=$(git rev-parse HEAD)
```

REST fallback: read `head.sha` (GitHub) or `diff_refs.head_sha` (GitLab) from the same JSON payload already fetched above — no extra round-trip needed.

- `LINK_BASE_SHA` — base commit SHA (the PR/MR target tip, or the merge-base for branch comparisons). Required by §5 "Showing change" to render before/after diagrams and to hyperlink "before" nodes to the prior revision:

```bash
# GitHub
LINK_BASE_SHA=$(gh pr view $PR_NUMBER --json baseRefOid -q .baseRefOid)
# external repo: add --repo $OWNER/$REPO

# GitLab
LINK_BASE_SHA=$(glab mr view $MR_NUMBER -F json | jq -r '.diff_refs.base_sha // .target_branch')
# external project: add -R $GROUP/$PROJECT

# Local diff (uncommitted): base is the current HEAD itself
LINK_BASE_SHA=$(git rev-parse HEAD)

# Branch comparison
LINK_BASE_SHA=$(git merge-base origin/$DEFAULT_BRANCH HEAD)
```

To extract the pre-change content of a single file (needed when the unified diff alone doesn't carry enough surrounding structure, e.g. class hierarchies):

```bash
git show $LINK_BASE_SHA:path/to/file
```

If the base SHA is unreachable (shallow clone, history pruned, target branch not fetched), skip "before" diagrams and announce once in chat: `"base revision unavailable — only 'after' diagrams created"`.

- `LINK_TEMPLATE` — pick by host shape; substitute `{path}` per reference, append `#L<start>-L<end>` line anchors when calling out a specific hunk:
  - GitHub-style: `https://{host}/{owner}/{repo}/blob/{sha}/{path}` (anchor: `#L{a}-L{b}`)
  - GitLab-style: `https://{host}/{group}/{project}/-/blob/{sha}/{path}` (anchor: `#L{a}-{b}`)
  - Bitbucket-style (example pattern, not exhaustive): `https://{host}/{workspace}/{repo}/src/{sha}/{path}`

**No-remote sources** (`local changes`, or a branch with no pushed remote / no PR): set `LINK_TEMPLATE=""` and announce in chat once: `"No remote URL available — file references shown as plain paths."` Do not invent URLs.

State the chosen template in chat before creating artifacts, e.g.: `Source links: https://github.com/acme/api/blob/<sha>/{path}`.
