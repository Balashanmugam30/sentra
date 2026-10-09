// tools/render-mcp-wrapper.js
// Render MCP Integration Handler for Antigravity.
// Hosted Render MCP Endpoint: https://mcp.render.com/mcp
// Authentication contract: Authorization: Bearer <RENDER_API_KEY>

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 1. Resolve RENDER_API_KEY from process environment or Windows User registry
let apiKey = process.env.RENDER_API_KEY?.trim();

if (!apiKey && process.platform === 'win32') {
  try {
    const out = execSync('reg query HKCU\\Environment /v RENDER_API_KEY', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = out.match(/RENDER_API_KEY\s+REG_SZ\s+(\S+)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
    }
  } catch (_) {}
}

if (!apiKey) {
  console.error(
    '[render-mcp-wrapper] RENDER_API_KEY environment variable is not configured.\n' +
    'The hosted Render MCP server (https://mcp.render.com/mcp) requires API key authentication.\n' +
    'Please configure RENDER_API_KEY in your environment.'
  );
  process.exit(1);
}

// 2. Locate mcp-remote proxy binary (from npx cache or global/local modules)
function findProxyBinary() {
  const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
  if (fs.existsSync(npxCache)) {
    try {
      const dirs = fs.readdirSync(npxCache);
      for (const d of dirs) {
        const candidate = path.join(npxCache, d, 'node_modules', 'mcp-remote', 'dist', 'proxy.js');
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    } catch (_) {}
  }
  return null;
}

const proxyBinary = findProxyBinary();

let child;
if (proxyBinary) {
  // Direct node execution with array arguments preserves exact headers without shell quote mangling
  child = spawn(
    process.execPath,
    [proxyBinary, 'https://mcp.render.com/mcp', '--header', `Authorization: Bearer ${apiKey}`],
    {
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        RENDER_API_KEY: apiKey,
      },
    }
  );
} else {
  // Fallback to npx with header argument
  child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['-y', 'mcp-remote', 'https://mcp.render.com/mcp', '--header', `Authorization: Bearer ${apiKey}`],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        RENDER_API_KEY: apiKey,
      },
    }
  );
}

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('[render-mcp-wrapper] Process error:', err.message);
  process.exit(1);
});
