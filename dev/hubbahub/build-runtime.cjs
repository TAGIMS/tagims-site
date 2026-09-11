// Reuse the published Hub runtime and theme. No forked widget code or old demo adapter.
const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../../apps/hubbahub/index.html');
let html = fs.readFileSync(source, 'utf8');
if (!html.includes('<head>')) throw new Error('Hub head not found');
html = html.replace('<head>', `<head>
  <base href="/apps/hubbahub/">
  <meta name="robots" content="noindex,nofollow">
  <script src="/dev/hubbahub/workspace-storage.js"></script>`);
fs.writeFileSync(path.join(__dirname, 'hub-runtime.html'), html);
console.log('Built sandbox wrapper from published Hub 18 markup.');
