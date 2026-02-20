# agent-browser CLI Reference

Headless browser automation for AI agents. Binary at `~/.bun/bin/agent-browser`.

## Navigation

```bash
agent-browser open <url>           # Navigate to URL
agent-browser back                 # Go back
agent-browser forward              # Go forward
agent-browser reload               # Reload page
agent-browser close                # Close browser
```

## Screenshots & PDF

```bash
agent-browser screenshot                       # Base64 to stdout
agent-browser screenshot /tmp/page.png         # Save to file
agent-browser screenshot /tmp/full.png --full  # Full page capture
agent-browser pdf /tmp/page.pdf                # Save as PDF
```

**Always wait after page load before screenshotting:**

```bash
agent-browser open <url>
agent-browser wait 1000        # Wait 1 second for animations/transitions
agent-browser screenshot /tmp/out.png
```

## Accessibility Snapshot

Returns an accessibility tree with element refs (`@e1`, `@e2`, etc.) for AI reasoning:

```bash
agent-browser snapshot                    # Full tree
agent-browser snapshot -i                 # Interactive elements only
agent-browser snapshot -c                 # Compact (remove empty nodes)
agent-browser snapshot -d 5               # Limit depth
agent-browser snapshot -s "#main-content" # Scope to selector
```

Use refs from snapshot in subsequent commands:

```bash
agent-browser click @e5
agent-browser fill @e12 "text"
```

## Interaction

```bash
agent-browser click <selector>           # Click element (or @ref)
agent-browser dblclick <selector>        # Double-click
agent-browser type <selector> <text>     # Type into element (appends)
agent-browser fill <selector> <text>     # Clear and fill
agent-browser press <key>                # Press key (Enter, Tab, Control+a)
agent-browser hover <selector>           # Hover element
agent-browser check <selector>           # Check checkbox
agent-browser uncheck <selector>         # Uncheck checkbox
agent-browser select <selector> <val>    # Select dropdown option
agent-browser scroll <direction> [px]    # Scroll (up/down/left/right)
agent-browser upload <selector> <files>  # Upload files
agent-browser wait <selector|ms>         # Wait for element or time
```

## Semantic Find

Find elements by semantic attributes and perform actions:

```bash
agent-browser find role <value> [action] [text]
agent-browser find text <value> [action] [text]
agent-browser find label <value> [action] [text]
agent-browser find placeholder <value> [action] [text]
agent-browser find testid <value> [action] [text]
```

Example: `agent-browser find role button click` — finds a button and clicks it.

## Get Information

```bash
agent-browser get text [selector]        # Get text content
agent-browser get html [selector]        # Get HTML content
agent-browser get value [selector]       # Get input value
agent-browser get attr <name> [selector] # Get attribute
agent-browser get title                  # Get page title
agent-browser get url                    # Get current URL
agent-browser get count <selector>       # Count matching elements
```

## JavaScript Execution

```bash
agent-browser eval "document.title"
agent-browser eval "document.querySelectorAll('a').length"
agent-browser eval "JSON.stringify([...document.querySelectorAll('nav a')].map(a => ({href: a.href, text: a.textContent})))"
```

## Sessions

Sessions persist browser state across commands:

```bash
agent-browser session                    # Show current session
agent-browser session list               # List all sessions
agent-browser --session <name> open <url>  # Use named session
```

## Tabs

```bash
agent-browser tab list                   # List open tabs
agent-browser tab new [url]              # Open new tab
agent-browser tab close [index]          # Close tab
agent-browser tab <index>               # Switch to tab
```

## Browser Settings

```bash
agent-browser set viewport <width> <height>
agent-browser set device <name>
agent-browser set media [dark|light]
```

## Global Options

| Flag               | Description                          |
| ------------------ | ------------------------------------ |
| `--session <name>` | Use specific browser session         |
| `--headed`         | Run in headed mode (visible browser) |
| `--json`           | Output as JSON                       |
| `--full, -f`       | Full page capture (screenshots/pdf)  |

## Common Pattern: Screenshot + Upload to Miro

```bash
# 1. Capture
agent-browser open http://localhost:3000
agent-browser wait 1000
agent-browser screenshot /tmp/capture.png

# 2. Upload to board (use miroctl)
IMG_ID=$(miroctl images create-image-item-using-local-file \
  --board-id $BID --file /tmp/capture.png | jq -r '.id')
```
