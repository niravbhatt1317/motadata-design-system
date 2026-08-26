#!/usr/bin/env node
/**
 * Streamable HTTP transport (stateless) — for remote / team use.
 * Runs locally now (PORT, default 3333); deploying it behind a host + auth is a later step.
 * Stateless: a fresh server + transport per request (the server is read-only, so no session needed).
 */
import express from 'express'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { buildServer } from './server.js'

const PORT = Number(process.env.PORT || 3333)
const app = express()
app.use(express.json({ limit: '4mb' }))

app.get('/health', (_req, res) => res.json({ ok: true, server: 'observeops-ds-mcp' }))

app.post('/mcp', async (req, res) => {
  const server = buildServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.on('close', () => {
    transport.close()
    server.close()
  })
  try {
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (err) {
    console.error('MCP request error:', err)
    if (!res.headersSent) res.status(500).json({ error: 'internal error' })
  }
})

// Stateless mode has no standalone SSE / session deletion.
const methodNotAllowed = (_req: express.Request, res: express.Response) =>
  res.status(405).json({ error: 'Method not allowed (stateless server — use POST /mcp).' })
app.get('/mcp', methodNotAllowed)
app.delete('/mcp', methodNotAllowed)

app.listen(PORT, () => {
  console.error(`observeops-ds MCP server (HTTP) on http://localhost:${PORT}/mcp`)
})
