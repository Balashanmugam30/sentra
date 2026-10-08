// tools/render-mcp-wrapper.js
// Production-grade Render MCP wrapper for Antigravity
// Resolves OAuth dynamic client registration incompatibility by injecting Bearer API key authorization header.

const { spawn } = require('child_process');

const apiKey = process.env.RENDER_API_KEY;

const args = ['-y', 'mcp-remote', 'https://mcp.render.com/mcp'];

if (apiKey && apiKey.trim().length > 0) {
  args.push('--header', `Authorization: Bearer ${apiKey.trim()}`);
}

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('[render-mcp-wrapper] Failed to launch mcp-remote:', err);
  process.exit(1);
});
