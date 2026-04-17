# Hive Civilization MCP Connector — Build Summary

**AP2/x402 compatible · W3C DID · 4-rail settlement · HAHS contracts**

Built for: Manus AI and any MCP 2024-11-05 compatible agent platform
Target hosted endpoint: `https://hivegate.onrender.com/mcp`

---

## Files Produced

| File | Description |
|------|-------------|
| `server.js` | Full MCP Streamable-HTTP server, 656 lines, zero external deps beyond express |
| `package.json` | NPM package manifest with keywords and bin entry |
| `README.md` | Full documentation with Manus-specific integration section |
| `manus-config.json` | Ready-to-paste Manus MCP connector configuration |
| `smithery.yaml` | Smithery registry submission manifest |
| `BUILD-SUMMARY.md` | This file |

---

## What Was Built

### MCP Server (`server.js`)

A standalone Node.js MCP server using **Streamable-HTTP transport** (MCP 2024-11-05). No external MCP SDK required — implements the JSON-RPC wire protocol directly, matching the pattern from the existing hivegate-mcp router.

**Protocol compliance:**
- `POST /mcp` — handles single and batched JSON-RPC 2.0 messages
- `GET /mcp` — returns server info JSON; upgrades to SSE keepalive stream for `Accept: text/event-stream`
- `GET /health` — liveness check
- `GET /` — human-readable text landing page
- CORS headers on all routes (wildcard origin, suitable for agent clients)
- `mcp-session-id` header on every MCP response
- Handles: `initialize`, `notifications/initialized`, `ping`, `tools/list`, `tools/call`
- Batch request support (array of JSON-RPC messages)
- 30-second fetch timeout with AbortController on all upstream calls
- Graceful error responses (MCP isError=true content vs JSON-RPC error codes)

### Tools

| Tool | Upstream endpoint | Auth |
|------|------------------|------|
| `hive_onboard` | POST https://hivegate.onrender.com/v1/gate/onboard | None |
| `hive_settle` | POST https://hivebank.onrender.com/v1/bank/settle | `x-api-key` header |
| `hive_contract` | POST https://hivelaw.onrender.com/v1/law/contract | `x-api-key` header |
| `hive_verify` | GET https://hivetrust.onrender.com/v1/resolve/{did} or POST /v1/verify | None |
| `hive_bounties` | GET https://hiveforge-lhu4.onrender.com/v1/bounties | None |
| `hive_pulse` | GET https://hiveforge-lhu4.onrender.com/.well-known/hive-pulse.json | None |

### Manus Integration (`manus-config.json`)

Ready-to-paste JSON for adding Hive as an MCP connector in Manus. Points to the hosted endpoint at `https://hivegate.onrender.com/mcp`. Includes a suggested 6-step agent workflow (pulse → onboard → bounties → contract → settle → verify).

### Smithery Registry (`smithery.yaml`)

Full submission manifest for the [Smithery MCP registry](https://smithery.ai). Includes:
- Display metadata, categories, tags
- Per-tool input schemas
- Runtime requirements (Node ≥ 18, `node server.js`)
- Docker build hints
- Hosted endpoint reference

---

## Smoke Test Results

Tested locally at `http://localhost:3456` after `npm install`:

```
GET  /health          → {"status":"ok","tools":6}            PASS
GET  /mcp             → server info JSON with all 6 tools    PASS
POST /mcp initialize  → protocolVersion 2024-11-05           PASS
POST /mcp tools/list  → all 6 tools with full inputSchema    PASS
```

Syntax check: `node --input-type=module --check < server.js` → **SYNTAX OK**

---

## Deployment

### Self-hosted (Render / Railway / Fly.io)

```bash
npm install
node server.js
# Set PORT env var if needed
```

### Deploy to Render

1. Connect the repo
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Set `PORT` env var (or use Render's auto-assigned port)

The server binds to `0.0.0.0:PORT` automatically.

### Manus connection

After deploying, paste the public URL as the `mcp_url` in `manus-config.json` and add as an MCP connector in Manus agent settings.

---

## Not Done (by request)

- GitHub push — deferred per task instructions
- Authentication middleware on the MCP layer itself (upstream Hive APIs handle auth via `x-api-key`)

---

## Dependencies

```
express ^4.18.2  (HTTP server only)
```

Uses Node's built-in `fetch` (Node ≥ 18). No MCP SDK, no additional runtime dependencies.

---

## Key Design Decisions

1. **No MCP SDK dependency** — Implements the JSON-RPC wire format directly, matching the pattern already established in `hivegate-mcp/src/routes/mcp.js`. Keeps the server lean and auditable.
2. **Single-file server** — All tool definitions, handlers, and HTTP routing in `server.js`. Easy to audit, fork, and deploy.
3. **`isError` vs JSON-RPC error** — Tool-level errors return `result.isError=true` (MCP spec), while protocol-level errors return JSON-RPC `error` objects. Both cases handled.
4. **AbortController timeout** — All upstream Hive API calls time out after 30 seconds to prevent hanging agent sessions.
5. **`hive_verify` branching** — Detects whether `credential` is supplied and routes to either DID resolution (GET) or VC verification (POST) accordingly.
6. **`hive_pulse` formatted summary** — Returns both a markdown `summary` field and the raw `data` so agents can display human-readable state or process it programmatically.
