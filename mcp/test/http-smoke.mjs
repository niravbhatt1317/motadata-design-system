/**
 * HTTP smoke test — spawns dist/http.js, connects a real MCP client over streamable HTTP, asserts.
 * Run: npm run build && node test/http-smoke.mjs
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { spawn } from 'node:child_process'
import assert from 'node:assert'

const PORT = 3939
const text = (r) => (r.content || []).map((c) => c.text).join('\n')

const child = spawn('node', ['dist/http.js'], { env: { ...process.env, PORT: String(PORT) } })

// wait for the "on http://..." ready line on stderr (no sleep)
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('server did not start in time')), 10000)
  child.stderr.on('data', (d) => {
    if (d.toString().includes('http://localhost')) {
      clearTimeout(t)
      resolve()
    }
  })
  child.on('exit', (c) => reject(new Error('server exited early, code ' + c)))
})

try {
  const transport = new StreamableHTTPClientTransport(new URL(`http://localhost:${PORT}/mcp`))
  const client = new Client({ name: 'http-smoke', version: '1.0.0' })
  await client.connect(transport)

  const tools = (await client.listTools()).tools.map((t) => t.name)
  assert(tools.includes('search_components'), 'tools advertised over HTTP')

  const s = text(await client.callTool({ name: 'search_components', arguments: { query: 'slide-over edit panel' } }))
  assert(/drawer/i.test(s), 'search over HTTP finds drawer')

  const noMatch = text(await client.callTool({ name: 'search_components', arguments: { query: 'nope-zzz' } }))
  assert(/STOP and ASK/i.test(noMatch), 'no-match ASK signal over HTTP')

  await client.close()
  console.log(`HTTP SMOKE PASSED — ${tools.length} tools reachable over streamable HTTP on :${PORT}`)
} finally {
  child.kill()
}
