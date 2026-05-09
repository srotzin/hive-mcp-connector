<!-- HIVE_BANNER_V1 -->
<p align="center">
  <a href="https://hivegate.onrender.com/health">
    <img src="https://hivegate.onrender.com/og.svg" alt="HiveConnector · Cross-Ecosystem Agent Connector MCP" width="100%"/>
  </a>
</p>

<h1 align="center">hive-mcp-connector</h1>

<p align="center"><strong>Cross-ecosystem agent connector — translates MCP tool calls into LangChain Tools, CrewAI tasks, AutoGen function calls.</strong></p>

<p align="center">
  <a href="https://smithery.ai/server/hivecivilization"><img alt="Smithery" src="https://img.shields.io/badge/Smithery-hivecivilization-C08D23?style=flat-square"/></a>
  <a href="https://glama.ai/mcp/servers"><img alt="Glama" src="https://img.shields.io/badge/Glama-pending-C08D23?style=flat-square"/></a>
  <a href="https://hivegate.onrender.com/health"><img alt="Live" src="https://img.shields.io/badge/gateway-live-C08D23?style=flat-square"/></a>
  <a href="https://github.com/srotzin/hive-mcp-connector/releases"><img alt="Release" src="https://img.shields.io/github/v/release/srotzin/hive-mcp-connector?style=flat-square&color=C08D23"/></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-C08D23?style=flat-square"/></a>
</p>

<p align="center">
  <code>https://hivegate.onrender.com/mcp</code>
</p>

---

# HiveConnector

**Cross-ecosystem agent connector — translates MCP tool calls into LangChain Tools, CrewAI tasks, AutoGen function calls.**

MCP server for HiveConnector — cross-ecosystem bridge from MCP to LangChain, CrewAI, and AutoGen. W3C DID onboarding, 4-rail USDC/USDCx/USAd/ALEO settlement, HAHS contracts, trust verification, and live network pulse. A2A-compatible, x402-gated. Real rails.

## What this is

`hive-mcp-connector` is a Model Context Protocol (MCP) server that exposes the HiveConnector platform on the Hive Civilization to any MCP-compatible client (Claude Desktop, Cursor, Manus, etc.). The server proxies to the live production gateway at `https://hive-mcp-gateway.onrender.com`.

- **Protocol:** MCP 2024-11-05 over Streamable-HTTP / JSON-RPC 2.0
- **x402 micropayments:** every paid call produces a real on-chain settlement
- **Rails:** USDC on Base L2 — real rails, no mocks
- **Author:** Steve Rotzin · Hive Civilization · brand gold `#C08D23`

## Endpoints

| Path | Purpose |
|------|---------|
| `POST /mcp` | JSON-RPC 2.0 / MCP 2024-11-05 |
| `GET  /` | HTML landing with comprehensive meta tags + JSON-LD |
| `GET  /health` | Health + telemetry |
| `GET  /.well-known/mcp.json` | MCP discovery descriptor |
| `GET  /.well-known/security.txt` | RFC 9116 security contact |
| `GET  /robots.txt` | Allow-all crawl policy |
| `GET  /sitemap.xml` | Crawler sitemap |
| `GET  /og.svg` | 1200×630 Hive-gold OG image |
| `GET  /seo.json` | JSON-LD structured data (SoftwareApplication) |

## License

MIT. © Steve Rotzin / Hive Civilization. Brand gold `#C08D23` (Pantone 1245 C). Never `#f5c518`.

<!-- HIVE-GAMIFICATION-META-START -->
## Hive Gamification

This MCP server is part of the Hive Civilization gamification surface (10-mechanic capability taxonomy).

- Capability taxonomy: https://hive-gamification.onrender.com/.well-known/hive-gamification.json
- Centrifuge dashboard: https://hive-gamification.onrender.com/.well-known/hive-centrifuge.json
- Consolidated OpenAPI: https://hive-gamification.onrender.com/.well-known/openapi.json

**Surface tags:** `gamification.spec.v1` · `gamification.surface.public` · `gamification.signal.read-only` · `gamification.settlement.real-rails`

Real rails on Base L2 (USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`). Read-only signal layer. Brand gold `#C08D23`.
<!-- HIVE-GAMIFICATION-META-END -->

## Hive Civilization Directory

Part of the Hive Civilization — agent-native financial infrastructure.

- Endpoint Directory: https://thehiveryiq.com
- Live Leaderboard: https://hive-a2amev.onrender.com/leaderboard
- Revenue Dashboard: https://hivemine-dashboard.onrender.com
- Other MCP Servers: https://github.com/srotzin?tab=repositories&q=hive-mcp

Brand: #C08D23
<!-- /hive-footer -->


---

## Agent-Callable

This MCP server is fully agent-callable — no accounts, no API keys, no human approval required.

| Property | Value |
|----------|-------|
| Discovery URL | `https://hivemorph.onrender.com/.well-known/agent-card.json` |
| MCP endpoint | `https://hive-mcp-gateway.onrender.com/mcp` (JSON-RPC 2.0 / MCP 2024-11-05) |
| x402 pricing | `https://hivemorph.onrender.com/v1/x402/pricing` |
| Payment | USDC on Base 8453 via x402 |
| Treasury | `0x15184Bf50B3d3F52b60434f8942b7D52F2eB436E` |
| DID | `did:hivemorph:w2loren:0x6b11b1bcaf253c` |
| Hive site | [thehiveryiq.com](https://thehiveryiq.com) |

### Sample request

```bash
# 1. Get x402 quote (free)
curl -X POST https://hivemorph.onrender.com/v1/x402/quote \
  -H 'Content-Type: application/json' \
  -d '{"agent_did":"did:example:agent","profile":"standard"}'

# 2. Settle USDC on Base 8453 (ERC-681 URI in quote response)

# 3. Call with access token
curl -X POST https://hive-mcp-gateway.onrender.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'X-Hive-Access: <token_from_step_1>' \
  -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
```

