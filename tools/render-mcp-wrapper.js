// tools/render-mcp-wrapper.js
// Render MCP Integration Handler for Antigravity.
// Hosted Render MCP Endpoint: https://mcp.render.com/mcp
// Authentication contract: Authorization: Bearer <RENDER_API_KEY>

const apiKey = process.env.RENDER_API_KEY?.trim();

if (!apiKey) {
  console.error(
    '[render-mcp-wrapper] RENDER_API_KEY environment variable is not configured.\n' +
    'The hosted Render MCP server (https://mcp.render.com/mcp) requires API key authentication.\n' +
    'To authenticate, set RENDER_API_KEY in your environment.'
  );
  process.exit(1);
}

// When RENDER_API_KEY is present, proxy requests to the Render MCP server
const { spawn } = require('child_process');
const child = spawn('npx', ['-y', 'mcp-remote', 'https://mcp.render.com/mcp'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    RENDER_API_KEY: apiKey,
  },
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('[render-mcp-wrapper] Process error:', err);
  process.exit(1);
});

