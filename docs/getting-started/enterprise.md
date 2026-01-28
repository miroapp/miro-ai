# Enterprise Guide

If your organization uses Miro Enterprise, your admin must enable the MCP Server before you can connect.

## For Administrators

### Enabling MCP Server

1. Review the [Miro MCP Server Admin Guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide)
2. Review the [Beta Acknowledgement](https://help.miro.com/hc/en-us/articles/31621611644306-Miro-MCP-Server-Beta-Acknowledgement) for terms and conditions
3. Enable MCP Server for your organization in admin settings

### Security Considerations

- **Data Access**: MCP enables AI agents to read and create content on Miro boards
- **User Permissions**: AI access is governed by each user's existing Miro permissions
- **Audit Logging**: MCP actions are logged in your organization's audit trail
- **OAuth Scopes**: Review the permissions requested during OAuth authorization

### Controlling Access

You can enable MCP for:
- All users in your organization
- Specific teams or user groups
- Individual users (for pilot programs)

## For Users

### Requesting Access

If MCP is not enabled for your organization:

1. Contact your Miro administrator
2. Explain the use case (diagram generation, code generation from boards, etc.)
3. Point them to this guide and the admin resources above

### Connecting with Enterprise SSO

1. Configure MCP in your AI client (see [MCP Setup Guide](mcp-setup.md))
2. When prompted, authenticate via your organization's SSO
3. Select the appropriate team during OAuth
4. Authorize the connection

### Team Selection

During OAuth, you must select a specific team:
- You can only access boards from the selected team
- To access multiple teams, create separate MCP connections
- If you get "access denied" errors, verify you selected the correct team

## Security & Compliance

### OAuth 2.1

Miro MCP uses OAuth 2.1 with:
- Dynamic client registration
- PKCE (Proof Key for Code Exchange)
- Short-lived access tokens
- Secure token refresh

### Data Handling

- Board data is accessed in real-time via API calls
- Content is not stored by the MCP server
- Data flows directly between your AI client and Miro's API

### Rate Limits

Enterprise accounts have standard API rate limits:
- Requests are throttled to prevent abuse
- Rate limit headers are returned with each response
- Backoff automatically when limits are reached

## Troubleshooting Enterprise Issues

### "MCP not enabled" Error

- Contact your Miro admin to enable MCP Server
- Verify your user account has MCP access

### "Team access denied" Error

- You may have selected the wrong team during OAuth
- Disconnect and reconnect, selecting the correct team
- Verify you have access to the target team in Miro

### SSO Authentication Failures

- Ensure your SSO session is active
- Try logging into Miro web app first
- Contact your IT team if SSO issues persist

## Resources

- [Miro MCP Server Admin Guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide)
- [Beta Acknowledgement](https://help.miro.com/hc/en-us/articles/31621611644306-Miro-MCP-Server-Beta-Acknowledgement)
- [Miro Developer Documentation](https://developers.miro.com/docs/mcp-intro)
