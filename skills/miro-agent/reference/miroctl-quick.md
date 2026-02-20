# miroctl CLI — Quick Reference

Full reference: [reference/miroctl.md](miroctl.md)

## Command Index

| Command group | Operations | Full ref lines |
|---------------|-----------|---------------|
| Auth | set-token, status, revoke | 45-53 |
| Boards | create, list, get, update, delete, copy | 55-64 |
| Items (generic) | get-items, get-items-within-frame, get, update, delete | 66-84 |
| Frames | create + update (two-step) | 86-101 |
| Sticky notes | create | 103-111 |
| Cards | create | 113-119 |
| Shapes | create (with shape types list) | 121-134 |
| Texts | create | 136-143 |
| Images | upload local file, create from URL, move to frame | 145-161 |
| Connectors | create | 163-171 |
| Tags | create, attach, get-items-by-tag | 173-184 |
| Groups | create, get-all, un-group | 186-192 |
| Bulk operations | create-items, from file | 194-203 |
| Board members | share, list | 205-213 |
| Documents (file) | upload from device | 215-220 |
| Embeds | create | 222-228 |
| API escape hatch | api call &lt;operationId&gt; | 230-241 |
| Pagination | --limit, --cursor, --all caveats | 243-260 |

## CRUD Pattern

`miroctl <type> create/get/update/delete --board-id $BID [--item-id $ID] [--data '{}']`

Capture IDs: `| jq -r '.id'`

## Global Options

`--profile`, `--base-url`, `--token`, `--format` (json|raw|jsonl), `--all`, `-v`, `--retry-unsafe`

## Key Gotchas

- **Frames require two calls:** create (title only) then update (position, size, style)
- **Sleep 2s after image upload** before moving to a frame
- **`--all` breaks on cursor-based endpoints** — use `--limit` + `--cursor` instead
- **`items get-items` minimum `--limit` is 10**
- **Output is JSON** — parse with `jq`, capture IDs with `| jq -r '.id'`
