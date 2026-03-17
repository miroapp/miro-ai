# Troubleshooting

Common issues and solutions for Miro AI integrations.

## Connection Issues

### MCP Server Not Reachable

**Symptoms:**
- Connection timeout errors
- "Cannot connect to server" messages

**Solutions:**
1. Verify network access to `https://mcp.miro.com/`
2. Check if a firewall or proxy is blocking the connection
3. Try accessing the URL in a browser to test connectivity

### MCP Client Not Supported

**Symptoms:**
- No MCP option in your AI tool
- "MCP not supported" errors

**Solutions:**
1. Check if your AI client supports MCP ([supported clients](getting-started/mcp-setup.md))
2. Update to the latest version
3. Some clients have MCP but don't support remote/HTTP connections

### Plugin Not Loading

**Symptoms:**
- Plugin commands not appearing
- `/plugin list` doesn't show the plugin

**Solutions:**
1. Restart Claude Code after installing
2. Verify the plugin directory structure
3. Check that `plugin.json` is valid JSON
4. Run `/plugin add ./path` to re-register

## Duplicate MCP Servers

### Multiple Miro Servers Active

**Symptoms:**
- Duplicate Miro tools in the tool list
- Being prompted to authenticate with Miro multiple times
- AI unsure which set of Miro tools to use
- Multiple Miro entries in your MCP server list

**Cause:** There are three ways Miro MCP can be configured, and each creates an independent server instance with its own auth session:

| Source | Typical scope | Who it's for |
|--------|--------------|--------------|
| **Plugin / extension** (from miro-ai repo) | User | Everyone — recommended for clients that support it |
| **Manual JSON config** (`"url": "https://mcp.miro.com/"`) | User or project | Clients without plugin/extension support |
| **Local dev server** (`http://localhost:...`) | Project | MCP server developers only |

If more than one is active in the same client, you get duplicate tools and auth conflicts — even though they point to the same server.

**How to check:** Look at your client's MCP server list. If you see more than one Miro entry (excluding a local dev server you intentionally configured), you have duplicates.

**Fix — use only one method per client:**

#### If your client has a Miro plugin or extension

For **Claude Code**, **Cursor**, **Gemini CLI**, and **Kiro**: the plugin/extension already manages the MCP connection. Remove any manual config:

**Claude Code:**
```bash
claude mcp remove miro --scope user
claude mcp remove miro --scope local
```
If you named the server differently, check `claude mcp list` for the actual name and substitute it.

**Cursor:**
1. Open Settings (`Cmd/Ctrl + ,`)
2. Navigate to **Features** > **MCP Servers**
3. Delete any manually-added "miro" entry pointing to `https://mcp.miro.com/`

**Gemini CLI:**
Remove any manually-added `miro` server entry from your MCP configuration in `settings.json`.

Restart your client after removal.

#### If your client has no plugin

For **VSCode + Copilot**, **Windsurf**, and other clients without a dedicated Miro plugin: manual JSON config is the correct approach. Just ensure you have only **one** `miro` entry.

If a Miro plugin becomes available for your client later, switch to it and remove the manual entry.

#### If you're also running a local dev server

Use a **distinct name** (e.g., `miro-local`) at **project scope** so it doesn't collide with the production server:

```json
{
  "mcpServers": {
    "miro-local": {
      "url": "http://localhost:9111/"
    }
  }
}
```

## Authentication Issues

### OAuth Flow Fails

**Symptoms:**
- Redirect loops during authentication
- "Authorization failed" errors

**Solutions:**
1. Clear browser cookies for miro.com
2. Try a different browser
3. Ensure pop-ups are not blocked
4. Check if you're logged into the correct Miro account

### Team Access Denied

**Symptoms:**
- "You don't have access to this board"
- "Team not found" errors

**Solutions:**
1. **Re-authenticate** and select the correct team
2. Verify you have access to the board in Miro's web interface
3. Miro MCP is team-specific - you can only access boards from the team you selected

### Token Expired

**Symptoms:**
- Requests start failing after working initially
- "Invalid token" or "Token expired" errors

**Solutions:**
1. Disconnect and reconnect to refresh your session
2. In Claude Code: `/plugin remove miro` then reinstall
3. Clear MCP settings and reconfigure

### Enterprise Not Enabled

**Symptoms:**
- "MCP not enabled for your organization"
- Cannot complete OAuth flow

**Solutions:**
1. Contact your Miro administrator
2. Ask them to enable MCP Server ([admin guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide))
3. Review the [Enterprise Guide](getting-started/enterprise.md)

## Claude Code Plugin Issues

### Commands Not Working

**Symptoms:**
- `/miro:diagram` does nothing
- Command not recognized

**Solutions:**
1. Ensure the plugin is installed: `/plugin list`
2. Restart Claude Code
3. Verify Miro MCP is authenticated
4. Check the command syntax matches documentation

### Skills Not Activating

**Symptoms:**
- Claude doesn't use Miro-specific knowledge
- Generic responses about Miro

**Solutions:**
1. Skills activate based on conversation context
2. Mention "Miro board" or "MCP tools" explicitly
3. Verify the skill exists in the plugin

### Hooks Not Running

**Symptoms:**
- Stop hook doesn't execute
- Task tracking not syncing

**Solutions:**
1. Verify `hooks.json` is valid JSON
2. Check script permissions (`chmod +x script.sh`)
3. Test the script manually
4. Check Claude Code logs for hook errors

## Kiro Power Issues

### Power Not Activating

**Symptoms:**
- Kiro doesn't use board context
- No Miro tools available

**Solutions:**
1. Verify the power is configured correctly
2. Check `mcp.json` is valid
3. Authenticate with Miro when prompted
4. Mention "the board" or "diagrams" to trigger

### Authentication Prompts Loop

**Symptoms:**
- Repeated authentication prompts
- OAuth never completes

**Solutions:**
1. Check browser pop-up settings
2. Try authenticating manually first
3. Verify OAuth is enabled in config

## Gemini CLI Issues

### Extension Not Loaded

**Symptoms:**
- Miro tools not available
- Extension not recognized

**Solutions:**
1. Verify `gemini-extension.json` is valid JSON
2. Check the file is in the correct location
3. Ensure Gemini CLI supports the extension format

## MCP Tool Errors

### Board Not Found

**Symptoms:**
- "Board not found" errors
- Invalid board ID

**Solutions:**
1. Use the full board URL including `https://`
2. Verify you have access to the board
3. Check the team selection during OAuth

### Rate Limiting

**Symptoms:**
- Requests failing intermittently
- "Too many requests" errors

**Solutions:**
1. Slow down request frequency
2. Batch operations where possible
3. Wait a few minutes before retrying

### Invalid Parameters

**Symptoms:**
- "Invalid parameter" errors
- Tool calls failing

**Solutions:**
1. Check parameter types match documentation
2. Verify required parameters are provided
3. See [Tools Reference](mcp/tools-reference.md) for correct formats

## Debugging Tools

### MCP Inspector

Use [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to diagnose connection issues:

1. Install the inspector
2. Point it at `https://mcp.miro.com/`
3. Test authentication and tool calls
4. View detailed error messages

### Claude Code Logs

Check Claude Code logs for detailed error information:

1. Open Claude Code settings
2. Find the log file location
3. Search for errors related to MCP or plugins

### Browser Developer Tools

For OAuth issues:

1. Open browser dev tools (F12)
2. Go to Network tab
3. Attempt authentication
4. Look for failed requests and error responses

## Getting Help

If issues persist:

- [Open an issue](https://github.com/miroapp/miro-ai/issues) on GitHub
- [Share feedback](https://q2oeb0jrhgi.typeform.com/to/YATmJPVx) via the feedback form
- Join the [Miro Developer Community](https://community.miro.com/)
