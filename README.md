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
