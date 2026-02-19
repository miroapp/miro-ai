# agent-browser — Quick Reference

Full reference: [reference/agent-browser.md](agent-browser.md)

## Command Index

| Command group | Key commands | Full ref lines |
|---------------|-------------|---------------|
| Navigation | open, back, forward, reload, close | 5-13 |
| Screenshots & PDF | screenshot (file/stdout/--full), pdf | 15-29 |
| Accessibility snapshot | snapshot (-i interactive, -c compact, -d depth, -s selector) | 31-47 |
| Interaction | click, type, fill, press, hover, check, select, scroll, wait | 49-64 |
| Semantic find | find role/text/label/placeholder/testid [action] | 66-78 |
| Get information | get text/html/value/attr/title/url/count | 80-90 |
| JavaScript | eval "expression" | 92-98 |
| Sessions | session list, --session \<name\> | 100-108 |
| Tabs | tab list/new/close/\<index\> | 110-117 |
| Browser settings | set viewport/device/media | 119-125 |
| Global options | --session, --headed, --json, --full | 127-135 |

## Key Pattern: Screenshot + Upload to Miro

```bash
agent-browser open <url>
agent-browser wait 1000          # always wait after page load
agent-browser screenshot /tmp/out.png
# then use miroctl to upload
```

## Essential Rules

- Always `wait 1000` after `open` before taking screenshots
- Use `snapshot -i` to get interactive element refs (@e1, @e2...) for click/fill
- Binary at `~/.bun/bin/agent-browser`
