#!/usr/bin/env node
/**
 * stdio transport — how local agents (Claude Code, Cursor, Windsurf, Cline) run the server:
 *   npx -y @mtdt/observeops-ds-mcp
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { buildServer } from './server.js'

async function main() {
  const server = buildServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // Logs go to stderr so they never corrupt the stdio JSON-RPC stream on stdout.
  console.error('observeops-ds MCP server running on stdio')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
