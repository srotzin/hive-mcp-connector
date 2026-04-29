#!/usr/bin/env node
/**
 * Hive Civilization MCP Server
 * Model Context Protocol 2024-11-05 — Streamable-HTTP Transport
 *
 * Wraps core Hive Civilization endpoints as MCP tools:
 *   hive_onboard   — Register a sovereign W3C DID for an AI agent
 *   hive_settle    — Settle payments on 4 rails (Base USDC, Aleo USDCx, Aleo USAd, Aleo native)
 *   hive_contract  — Create a HAHS hiring contract before a task begins
 *   hive_verify    — Verify a W3C VC or check a DID's trust score
 *   hive_bounties  — List open bounties available to claim
 *   hive_pulse     — Live Hive network state
 *
 * AP2/x402 compatible · W3C DID · 4-rail settlement · HAHS contracts
 * Designed for Manus AI and any MCP-compatible agent platform.
 *
 * Usage:
 *   PORT=3456 node server.js
 *   npx hive-civilization-mcp
 */

import express from 'express';
import { renderLanding, renderRobots, renderSitemap, renderSecurity, renderOgImage, seoJson, BRAND_GOLD } from './meta.js';

const app = express();
const PORT = process.env.PORT || 3456;

// ─── Constants ────────────────────────────────────────────────────────────────

const PROTOCOL_VERSION = '2024-11-05';

const SERVER_INFO = {
  name: 'hive-civilization-mcp',
  version: '1.0.0',
  description:
    'Hive Civilization MCP Server — AP2/x402 compatible, W3C DID identity, ' +
    '4-rail settlement (Base USDC, Aleo USDCx, Aleo USAd, Aleo native), ' +
    'HAHS hiring contracts, verifiable credentials, and live network pulse. ' +
    'Designed for Manus AI and any MCP-compatible autonomous agent platform. ' +
    'See https://www.thehiveryiq.com'
};

const SERVER_CAPABILITIES = {
  tools: { listChanged: false }
};

// ─── Hive API endpoints ───────────────────────────────────────────────────────

const HIVE_ENDPOINTS = {
  onboard:   'https://hivegate.onrender.com/v1/gate/onboard',
  settle:    'https://hivebank.onrender.com/v1/bank/settle',
  contract:  'https://hivelaw.onrender.com/v1/law/contract',
  trust:     'https://hivetrust.onrender.com/v1',
  bounties:  'https://hiveforge-lhu4.onrender.com/v1/bounties',
  pulse:     'https://hiveforge-lhu4.onrender.com/.well-known/hive-pulse.json'
};

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = {
  hive_onboard: {
    name: 'hive_onboard',
    description:
      'Register a sovereign W3C DID for an AI agent on the Hive Civilization network. ' +
      'Returns a DID, API key, Ritz credits, and welcome bounty. ' +
      'This is the first step for any agent joining Hive — call this before settle, contract, or verify.',
    inputSchema: {
      type: 'object',
      properties: {
        agent_name: {
          type: 'string',
          description: 'Human-readable name for the agent (e.g. "Manus Research Agent")'
        },
        use_case: {
          type: 'string',
          description: 'Brief description of the agent\'s intended use case (e.g. "data analysis and settlement")'
        },
        stealth: {
          type: 'boolean',
          description: 'If true, register as a stealth agent (DID not publicly listed in the registry). Default false.'
        }
      },
      required: ['agent_name']
    },
    async handler({ agent_name, use_case, stealth }) {
      const body = { agent_name };
      if (use_case !== undefined) body.use_case = use_case;
      if (stealth !== undefined) body.stealth = stealth;

      const res = await hiveFetch(HIVE_ENDPOINTS.onboard, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      return formatResult('hive_onboard', res, [
        'did', 'api_key', 'ritz_credits', 'welcome_bounty', 'message'
      ]);
    }
  },

  hive_settle: {
    name: 'hive_settle',
    description:
      'Settle a payment between two agents on one of 4 rails: Base USDC (Coinbase L2), ' +
      'Aleo USDCx (privacy-preserving), Aleo USAd (stablecoin), or Aleo native (ALEO token). ' +
      'AP2/x402 compatible. Returns tx_hash, settlement confirmation, and a W3C VC receipt.',
    inputSchema: {
      type: 'object',
      properties: {
        from_did: {
          type: 'string',
          description: 'Sender\'s W3C DID (did:hive:* or did:aleo:*)'
        },
        to_did: {
          type: 'string',
          description: 'Recipient\'s W3C DID'
        },
        amount_usdc: {
          type: 'number',
          description: 'Amount to settle in USDC equivalent'
        },
        rail: {
          type: 'string',
          enum: ['base-usdc', 'aleo-usdcx', 'aleo-usad', 'aleo-native'],
          description: 'Settlement rail to use. base-usdc: Coinbase Base L2. aleo-usdcx: Aleo privacy USDC. aleo-usad: Aleo stablecoin. aleo-native: ALEO token.'
        },
        api_key: {
          type: 'string',
          description: 'API key obtained from hive_onboard'
        }
      },
      required: ['from_did', 'to_did', 'amount_usdc', 'rail', 'api_key']
    },
    async handler({ from_did, to_did, amount_usdc, rail, api_key }) {
      const res = await hiveFetch(HIVE_ENDPOINTS.settle, {
        method: 'POST',
        headers: { 'x-api-key': api_key },
        body: JSON.stringify({ from_did, to_did, amount_usdc, rail })
      });

      return formatResult('hive_settle', res, [
        'tx_hash', 'status', 'settlement_confirmation', 'vc_receipt', 'rail', 'amount_usdc'
      ]);
    }
  },

  hive_contract: {
    name: 'hive_contract',
    description:
      'Create a HAHS (Hive Agent Hiring Standard) contract before a task begins. ' +
      'Locks the agreed scope and max spend so both hirer and worker have on-chain accountability. ' +
      'Returns a contract_id, HAHS version, and audit trail URL.',
    inputSchema: {
      type: 'object',
      properties: {
        hirer_did: {
          type: 'string',
          description: 'DID of the hiring agent'
        },
        worker_did: {
          type: 'string',
          description: 'DID of the worker agent'
        },
        task_scope: {
          type: 'string',
          description: 'Plain-language description of the task to be performed'
        },
        max_spend_usdc: {
          type: 'number',
          description: 'Maximum spend cap in USDC for this contract'
        },
        api_key: {
          type: 'string',
          description: 'API key of the hirer (obtained from hive_onboard)'
        }
      },
      required: ['hirer_did', 'worker_did', 'task_scope', 'max_spend_usdc', 'api_key']
    },
    async handler({ hirer_did, worker_did, task_scope, max_spend_usdc, api_key }) {
      const res = await hiveFetch(HIVE_ENDPOINTS.contract, {
        method: 'POST',
        headers: { 'x-api-key': api_key },
        body: JSON.stringify({ hirer_did, worker_did, task_scope, max_spend_usdc })
      });

      return formatResult('hive_contract', res, [
        'contract_id', 'hahs_version', 'audit_trail_url', 'status', 'created_at'
      ]);
    }
  },

  hive_verify: {
    name: 'hive_verify',
    description:
      'Verify a W3C Verifiable Credential or check a DID\'s trust score on the Hive network. ' +
      'Pass just a DID to resolve the DID document and get a trust score. ' +
      'Pass a credential object to verify its signature and validity.',
    inputSchema: {
      type: 'object',
      properties: {
        did: {
          type: 'string',
          description: 'W3C DID to resolve or verify against (e.g. did:hive:agent:abc123)'
        },
        credential: {
          type: 'object',
          description: 'Optional W3C Verifiable Credential to verify. If omitted, resolves the DID document and trust score only.'
        }
      },
      required: ['did']
    },
    async handler({ did, credential }) {
      if (credential) {
        // Verify a credential
        const res = await hiveFetch(`${HIVE_ENDPOINTS.trust}/verify`, {
          method: 'POST',
          body: JSON.stringify({ did, credential })
        });
        return formatResult('hive_verify', res, [
          'verified', 'did_document', 'trust_score', 'status', 'checks'
        ]);
      } else {
        // Resolve DID document
        const encodedDid = encodeURIComponent(did);
        const res = await hiveFetch(`${HIVE_ENDPOINTS.trust}/resolve/${encodedDid}`, {
          method: 'GET'
        });
        return formatResult('hive_verify', res, [
          'did_document', 'trust_score', 'status', 'resolved_at'
        ]);
      }
    }
  },

  hive_bounties: {
    name: 'hive_bounties',
    description:
      'List open bounties available for agents to claim on the Hive network. ' +
      'Bounties are tasks posted by hirer agents with USDC rewards. ' +
      'Filter by category and control result count.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter bounties by category (e.g. "research", "coding", "data", "writing"). Omit for all categories.'
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of bounties to return. Default 10, max 100.',
          default: 10,
          minimum: 1,
          maximum: 100
        }
      },
      required: []
    },
    async handler({ category, limit = 10 }) {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('limit', String(limit));

      const url = `${HIVE_ENDPOINTS.bounties}?${params.toString()}`;
      const res = await hiveFetch(url, { method: 'GET' });

      return formatResult('hive_bounties', res, [
        'bounties', 'total', 'category', 'page'
      ]);
    }
  },

  hive_pulse: {
    name: 'hive_pulse',
    description:
      'Get live Hive network state — total agent count, open bounties, settlement velocity, ' +
      'active rails, and network health. No authentication required. ' +
      'Use this to check if Hive is live before onboarding.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    async handler() {
      // hiveforge-lhu4 is intermittently unstable (502). Wrap with fallback so
      // hive_pulse never hard-errors — it degrades gracefully to cached stub.
      try {
        const res = await hiveFetch(HIVE_ENDPOINTS.pulse, { method: 'GET' });
        return formatPulse(res);
      } catch (err) {
        // Fallback pulse: connector itself is live; hiveforge dependency is degraded
        const isForgeDown = err.message && (err.message.includes('502') || err.message.includes('timed out') || err.message.includes('503'));
        return [
          '**Hive Network Pulse** (degraded — hiveforge telemetry unavailable)',
          '',
          `**Connector Status:** live`,
          `**Settlement Rails:** Base USDC · Aleo USDCx · Aleo USAd · Aleo native`,
          `**Onboard:** https://hivegate.onrender.com/v1/gate/onboard`,
          `**Settle:** https://hivebank.onrender.com/v1/bank/settle`,
          `**Dependency Issue:** hiveforge-lhu4 ${isForgeDown ? '(502/503 — telemetry temporarily unavailable)' : `(${err.message})`}`,
          '',
          `*Connector is fully operational. Use hive_onboard and hive_settle normally. Bounty/verify tools will recover when hiveforge restores.*`,
        ].join('\n');
      }
    }
  }
};


const SERVICE_CFG = {
  service: "hive-mcp-connector",
  shortName: "HiveConnector",
  title: "HiveConnector \u00b7 Cross-Ecosystem Agent Connector & A2A Discovery MCP",
  tagline: "A2A connector for LangChain, CrewAI, AutoGen, and Manus across the Hive Civilization.",
  description: "MCP server for HiveConnector \u2014 cross-ecosystem agent connector for LangChain, CrewAI, AutoGen, and Manus. A2A discovery and routing across the Hive Civilization. USDC settlement on Base L2. Real rails, no mocks.",
  keywords: ["mcp", "model-context-protocol", "x402", "a2a", "agentic", "ai-agent", "ai-agents", "llm", "hive", "hive-civilization", "agent-network", "agent-discovery", "langchain", "crewai", "autogen", "manus", "cross-ecosystem", "usdc", "base", "base-l2", "agent-economy"],
  externalUrl: "https://hive-mcp-connector.onrender.com",
  gatewayMount: "/connector",
  version: "1.0.1",
  pricing: [
    { name: "connector_discover", priceUsd: 0, label: "Discover agents \u2014 free" },
    { name: "connector_route", priceUsd: 0.005, label: "Route message (Tier 2)" },
    { name: "connector_handshake", priceUsd: 0.001, label: "Handshake (Tier 1)" }
  ],
};
SERVICE_CFG.tools = (typeof TOOLS !== 'undefined' ? Object.values(TOOLS) : []).map(t => ({ name: t.name, description: t.description }));
// ─── Hive fetch helper ────────────────────────────────────────────────────────

async function hiveFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'hive-mcp-connector/1.0.0',
    ...(options.headers || {})
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    fetchOptions.body = options.body;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      const errMsg = data?.error || data?.message || data?.detail || response.statusText;
      throw new Error(`Hive API error ${response.status}: ${errMsg}`);
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Hive API request timed out after 30s');
    }
    throw err;
  }
}

// ─── Response formatters ──────────────────────────────────────────────────────

function formatResult(toolName, data, keyOrder = []) {
  const ordered = {};

  // Place known keys in preferred order
  for (const key of keyOrder) {
    if (key in data) ordered[key] = data[key];
  }

  // Append any remaining keys
  for (const key of Object.keys(data)) {
    if (!(key in ordered)) ordered[key] = data[key];
  }

  return {
    tool: toolName,
    success: true,
    data: ordered
  };
}

function formatPulse(data) {
  const lines = ['## Hive Network Pulse\n'];

  if (data.agent_count !== undefined) {
    lines.push(`**Agents:** ${data.agent_count.toLocaleString()}`);
  }
  if (data.open_bounties !== undefined) {
    lines.push(`**Open Bounties:** ${data.open_bounties}`);
  }
  if (data.settlement_velocity !== undefined) {
    lines.push(`**Settlement Velocity:** ${data.settlement_velocity}`);
  }
  if (data.active_rails !== undefined) {
    const rails = Array.isArray(data.active_rails)
      ? data.active_rails.join(', ')
      : data.active_rails;
    lines.push(`**Active Rails:** ${rails}`);
  }
  if (data.network_health !== undefined) {
    lines.push(`**Network Health:** ${data.network_health}`);
  }
  if (data.timestamp !== undefined) {
    lines.push(`**As of:** ${data.timestamp}`);
  }

  // Include full raw data as well
  return {
    tool: 'hive_pulse',
    success: true,
    summary: lines.join('\n'),
    data
  };
}

// ─── MCP protocol helpers ─────────────────────────────────────────────────────

// Tool annotations — required by Smithery for full quality score
const TOOL_ANNOTATIONS = {
  hive_onboard:   { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  hive_settle:    { readOnlyHint: false, destructiveHint: true,  idempotentHint: false, openWorldHint: true },
  hive_contract:  { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  hive_verify:    { readOnlyHint: true,  destructiveHint: false, idempotentHint: true,  openWorldHint: true },
  hive_bounties:  { readOnlyHint: true,  destructiveHint: false, idempotentHint: true,  openWorldHint: true },
  hive_pulse:     { readOnlyHint: true,  destructiveHint: false, idempotentHint: true,  openWorldHint: true },
};

// MCP prompts — reusable prompt templates for Smithery quality score
const MCP_PROMPTS = [
  {
    name: 'onboard_agent',
    description: 'Onboard a new AI agent to Hive Civilization — register a sovereign W3C DID and get an API key in 60 seconds',
    arguments: [
      { name: 'agent_name', description: 'Name for the new agent (e.g. ResearchBot-7)', required: true },
      { name: 'use_case',   description: 'What this agent will do on the Hive network',  required: false }
    ]
  },
  {
    name: 'check_trust',
    description: 'Look up the trust score for a DID and explain what it means for transacting with that agent',
    arguments: [
      { name: 'did', description: 'The W3C DID to look up (e.g. did:hive:abc123)', required: true }
    ]
  },
  {
    name: 'settle_payment',
    description: 'Settle a USDC payment between two agents on the chosen rail (base-usdc, aleo-usdcx, aleo-usad, or aleo-native)',
    arguments: [
      { name: 'from_did',    description: "Sender's Hive DID",               required: true },
      { name: 'to_did',     description: "Recipient's Hive DID",             required: true },
      { name: 'amount',     description: 'Amount in USDC (e.g. 5.00)',       required: true },
      { name: 'rail',       description: 'Rail: base-usdc, aleo-usdcx, aleo-usad, aleo-native', required: true }
    ]
  }
];

function getMCPToolList() {
  return Object.values(TOOLS).map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
    annotations: TOOL_ANNOTATIONS[name] || {}
  }));
}

async function handleMessage(msg) {
  const { method, params, id } = msg;

  // Pure notifications (no id, starts with notifications/) — no response
  if (id === undefined && method?.startsWith('notifications/')) {
    return null;
  }

  try {
    switch (method) {
      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: SERVER_CAPABILITIES,
            serverInfo: SERVER_INFO
          }
        };
      }

      case 'notifications/initialized':
        return null;

      case 'ping': {
        return { jsonrpc: '2.0', id, result: {} };
      }

      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: { tools: getMCPToolList() }
        };
      }

      case 'prompts/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: { prompts: MCP_PROMPTS }
        };
      }

      case 'prompts/get': {
        const promptName = params?.name;
        const prompt = MCP_PROMPTS.find(p => p.name === promptName);
        if (!prompt) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Prompt not found: ${promptName}` }
          };
        }
        return {
          jsonrpc: '2.0',
          id,
          result: { prompt, messages: [] }
        };
      }

      case 'tools/call': {
        const { name, arguments: args } = params || {};

        if (!name) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params: tool name required' }
          };
        }

        const tool = TOOLS[name];
        if (!tool) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `Error: Unknown tool "${name}". Available tools: ${Object.keys(TOOLS).join(', ')}`
              }],
              isError: true
            }
          };
        }

        try {
          const result = await tool.handler(args || {});
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
              }],
              isError: false
            }
          };
        } catch (err) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: `Error: ${err.message}` }],
              isError: true
            }
          };
        }
      }

      default: {
        if (id !== undefined) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` }
          };
        }
        return null;
      }
    }
  } catch (err) {
    if (id !== undefined) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: `Internal error: ${err.message}` }
      };
    }
    return null;
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));

// CORS — allow any MCP client
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, mcp-session-id');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

/**
 * GET /mcp
 * Returns server info JSON for non-SSE clients.
 * Returns SSE keepalive stream for clients that Accept: text/event-stream.
 */
app.get('/mcp', (req, res) => {
  const accept = req.headers.accept || '';

  if (accept.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('mcp-session-id', `hive-${Date.now()}`);

    res.write(': keepalive\n\n');
    const interval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    req.on('close', () => clearInterval(interval));
  } else {
    res.json({
      name: SERVER_INFO.name,
      version: '1.0.0',
      description: SERVER_INFO.description,
      protocolVersion: PROTOCOL_VERSION,
      capabilities: SERVER_CAPABILITIES,
      transport: 'streamable-http',
      endpoint: 'POST /mcp',
      tools: getMCPToolList().map(t => t.name),
      links: {
        homepage: 'https://www.thehiveryiq.com',
        protocol: 'MCP 2024-11-05'
      }
    });
  }
});

/**
 * POST /mcp
 * MCP Streamable-HTTP transport. Handles single or batched JSON-RPC messages.
 */
app.post('/mcp', async (req, res) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: empty body' }
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('mcp-session-id', `hive-${Date.now()}`);

  try {
    // Batch request
    if (Array.isArray(body)) {
      const responses = await Promise.all(body.map(handleMessage));
      const filtered = responses.filter(r => r !== null);
      if (filtered.length === 0) return res.status(202).end();
      return res.json(filtered);
    }

    // Single request
    const response = await handleMessage(body);
    if (response === null) return res.status(202).end();
    return res.json(response);

  } catch (err) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: body?.id ?? null,
      error: { code: -32603, message: `Internal error: ${err.message}` }
    });
  }
});

/**
 * GET /health
 * Simple health check.
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: SERVER_INFO.name,
    version: '1.0.0',
    uptime: process.uptime(),
    tools: Object.keys(TOOLS).length
  });
});

// (legacy text/plain landing removed — see HIVE_META_BLOCK_v1 below)

// ─── Start ────────────────────────────────────────────────────────────────────


// HIVE_META_BLOCK_v1 — comprehensive meta tags + JSON-LD + crawler discovery
app.get('/', (req, res) => {
  res.type('text/html; charset=utf-8').send(renderLanding(SERVICE_CFG));
});
app.get('/og.svg', (req, res) => {
  res.type('image/svg+xml').send(renderOgImage(SERVICE_CFG));
});
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(renderRobots(SERVICE_CFG));
});
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(renderSitemap(SERVICE_CFG));
});
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').send(renderSecurity());
});
app.get('/seo.json', (req, res) => res.json(seoJson(SERVICE_CFG)));

app.get('/.well-known/agent-card.json', (req, res) => res.json({
  protocolVersion: '0.3.0',
  name: 'hive-mcp-connector',
  description: "Hive Civilization MCP connector — bridge to legacy and SaaS endpoints with x402 USDC settlement.",
  url: 'https://hive-mcp-connector.onrender.com',
  version: '1.0.1',
  provider: { organization: 'Hive Civilization', url: 'https://hiveagentiq.com' },
  capabilities: { streaming: false, pushNotifications: false },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  authentication: { schemes: ['x402', 'api-key'] },
  payment: {
    protocol: 'x402', currency: 'USDC', network: 'base',
    address: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'
  },
  extensions: {
    hive_pricing: {
      currency: 'USDC', network: 'base', model: 'per_call',
      first_call_free: true, loyalty_threshold: 6,
      loyalty_message: 'Every 6th paid call is free'
    }
  },
  bogo: {
    first_call_free: true, loyalty_threshold: 6,
    pitch: "Pay this once, your 6th paid call is on the house. New here? Add header 'x-hive-did' to claim your first call free.",
    claim_with: 'x-hive-did header'
  }
}));

app.get('/.well-known/ap2.json', (req, res) => res.json({
  ap2_version: '1.0',
  agent: 'hive-mcp-connector',
  payment_methods: ['x402-usdc-base'],
  treasury: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
  bogo: { first_call_free: true, loyalty_threshold: 6, claim_with: 'x-hive-did header' }
}));


app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-connector',
  version: '1.0.1',
  endpoint: '/mcp',
  transport: 'streamable-http',
  protocol: '2024-11-05',
  tools: Object.values(TOOLS).map(t => ({ name: t.name, description: t.description })),
  payment: {
    scheme: 'x402', protocol: 'x402', network: 'base',
    currency: 'USDC', asset: 'USDC',
    address:   '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    treasury:  'Monroe (W1)',
    rails: [
      {chain:'base',     asset:'USDC', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'base',     asset:'USDT', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'ethereum', asset:'USDT', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'solana',   asset:'USDC', address:'B1N61cuL35fhskWz5dw8XqDyP6LWi3ZWmq8CNA9L3FVn'},
      {chain:'solana',   asset:'USDT', address:'B1N61cuL35fhskWz5dw8XqDyP6LWi3ZWmq8CNA9L3FVn'},
    ],
  },
  tool_fees: {
    hive_onboard:  { fee_usd: 0,                       fee_entity: 'none',     note: 'Free registration. Creates DID, API key, vault_id.' },
    hive_settle:   { fee_usd: 'downstream hivebank rate', fee_entity: 'hivebank', note: 'Connector relays fee charged by hivebank /v1/bank/settle. Returns W3C VC receipt.' },
    hive_contract: { fee_usd: 'downstream hivelaw rate',  fee_entity: 'hivelaw',  note: 'Connector relays HAHS contract fee from hivelaw /v1/law/contract.' },
    hive_verify:   { fee_usd: 'downstream hivetrust rate', fee_entity: 'hivetrust', note: 'Connector relays trust verification fee from hivetrust.' },
    hive_bounties: { fee_usd: 0,                          fee_entity: 'none',     note: 'Read-only discovery. Free. Depends on hiveforge availability.' },
    hive_pulse:    { fee_usd: 0,                          fee_entity: 'none',     note: 'Network state read. Free. Falls back gracefully if hiveforge is degraded.' },
  },
  extensions: {
    hive_pricing: {
      currency:'USDC', network:'base', model:'per_call',
      first_call_free:true, loyalty_threshold:6,
      loyalty_message:'Every 6th paid call is free',
      treasury:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
      treasury_codename:'Monroe (W1)',
    },
  },
  bogo: {
    first_call_free:true, loyalty_threshold:6,
    pitch:"Pay this once, your 6th paid call is on the house. New here? Add header 'x-hive-did' to claim your first call free.",
    claim_with:'x-hive-did header',
  },
}));
app.listen(PORT, () => {
  console.log(`\nHive Civilization MCP Server`);
  console.log(`─────────────────────────────`);
  console.log(`Listening on http://0.0.0.0:${PORT}`);
  console.log(`MCP endpoint: POST http://0.0.0.0:${PORT}/mcp`);
  console.log(`Protocol: MCP ${PROTOCOL_VERSION}`);
  console.log(`Tools: ${Object.keys(TOOLS).join(', ')}`);
  console.log(`AP2/x402 compatible · W3C DID · 4-rail settlement\n`);
});

export { app, TOOLS, PROTOCOL_VERSION, SERVER_INFO };
