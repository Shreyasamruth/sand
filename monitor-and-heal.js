import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';

const PORT = 8080;
const CHECK_INTERVAL_MS = 15000; // Performance check every 15 seconds
const CONFIG_PATH = path.resolve('src/config.js');
const CLOUDFLARED_EXE = path.resolve('cloudflared.exe');
const SERVE_FILE_SCRIPT = path.resolve('serve-file.js');

let fileServerProc = null;
let tunnelProc = null;
let isHealing = false;

console.log('🛡️  Starting Continuous Web Performance & Stable HTTP/2 Tunnel Monitor...');

// Helper to send HTTP HEAD request
function checkHttp(urlStr, timeoutMs = 6000) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === 'https:' ? https : http;

      const req = client.request(urlStr, { method: 'HEAD', timeout: timeoutMs }, (res) => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode });
      });

      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'TIMEOUT' });
      });
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

// Start File Server process if not running
function ensureFileServer() {
  return new Promise(async (resolve) => {
    const res = await checkHttp(`http://127.0.0.1:${PORT}`);
    if (res.ok) {
      resolve(true);
      return;
    }

    console.log('⚠️ Local File Server not responding on port 8080. Respawning...');
    if (fileServerProc) {
      try { fileServerProc.kill(); } catch (e) {}
    }

    fileServerProc = spawn('node', [SERVE_FILE_SCRIPT], { cwd: process.cwd(), stdio: 'ignore' });
    
    // Wait 2 seconds for server boot
    setTimeout(async () => {
      const recheck = await checkHttp(`http://127.0.0.1:${PORT}`);
      if (recheck.ok) {
        console.log('✅ Local File Server active on port 8080 (5000 max connections)');
      } else {
        console.error('❌ Failed to restart Local File Server');
      }
      resolve(recheck.ok);
    }, 2000);
  });
}

// Read current URL from src/config.js
function getCurrentConfigUrl() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    const match = content.match(/downloadUrl:\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// Update src/config.js and push to Git with retries
function updateConfigAndPush(newUrl) {
  try {
    let content = fs.readFileSync(CONFIG_PATH, 'utf8');
    content = content.replace(/downloadUrl:\s*"[^"]*"/, `downloadUrl: "${newUrl}"`);
    fs.writeFileSync(CONFIG_PATH, content, 'utf8');
    console.log(`✅ Updated src/config.js with new Stable Tunnel URL: ${newUrl}`);

    console.log('🚀 Auto-pushing update to Git (Vercel auto-deploy)...');
    execSync('git add src/config.js', { cwd: process.cwd() });
    try {
      execSync(`git commit -m "Auto-heal: Updated HTTP/2 live tunnel URL to ${newUrl}"`, { cwd: process.cwd() });
    } catch (e) {}

    let pushed = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        execSync('git push origin main', { cwd: process.cwd() });
        console.log('🎉 Successfully pushed auto-healing update to Git origin main!');
        pushed = true;
        break;
      } catch (err) {
        console.log(`⚠️ Git push attempt ${attempt} failed. Retrying...`);
      }
    }
  } catch (e) {
    console.log('⚠️ Git auto-push notice:', e.message);
  }
}

// Respawn Cloudflare Tunnel process with HTTP/2 protocol and get new URL
function healTunnel() {
  return new Promise((resolve) => {
    console.log('🔄 Auto-healing Cloudflare Live Tunnel (HTTP/2 Protocol)...');
    if (tunnelProc) {
      try { tunnelProc.kill(); } catch (e) {}
    }

    try {
      execSync('taskkill /f /im cloudflared.exe', { stdio: 'ignore' });
    } catch (e) {}

    // Use --protocol http2 for persistent TCP connection without QUIC drops
    tunnelProc = spawn(CLOUDFLARED_EXE, ['tunnel', '--url', `http://127.0.0.1:${PORT}`, '--protocol', 'http2', '--no-autoupdate'], {
      cwd: process.cwd()
    });

    let foundUrl = false;

    function handleData(data) {
      if (foundUrl) return;
      const text = data.toString();
      const matches = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
      if (matches) {
        const liveUrl = matches.find(u => !u.includes('api.trycloudflare.com'));
        if (liveUrl) {
          foundUrl = true;
          console.log(`\n==================================================`);
          console.log(`⚡ AUTO-HEAL ACTIVATED NEW HTTP/2 LIVE TUNNEL:`);
          console.log(`🔗 ${liveUrl}`);
          console.log(`==================================================\n`);
          updateConfigAndPush(liveUrl);
          resolve(liveUrl);
        }
      }
    }

    tunnelProc.stdout.on('data', handleData);
    tunnelProc.stderr.on('data', handleData);

    setTimeout(() => {
      if (!foundUrl) {
        console.log('⚠️ Tunnel URL wait timeout. Retrying next cycle...');
        resolve(null);
      }
    }, 20000);
  });
}

// Perform continuous monitoring cycle
async function monitorCycle() {
  if (isHealing) return;
  
  const serverOk = await ensureFileServer();
  if (!serverOk) return;

  const currentUrl = getCurrentConfigUrl();
  if (!currentUrl) return;

  if (currentUrl.includes('trycloudflare.com')) {
    const startMs = Date.now();
    const res = await checkHttp(currentUrl, 6000);
    const latency = Date.now() - startMs;

    if (res.ok) {
      console.log(`[${new Date().toLocaleTimeString()}] 🟢 Performance OK | Status: ${res.statusCode} | Latency: ${latency}ms | URL: ${currentUrl}`);
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] 🔴 DETECTED DOWN/CRASH! Reason: ${res.error || res.statusCode} | URL: ${currentUrl}`);
      isHealing = true;
      await healTunnel();
      isHealing = false;
    }
  } else {
    console.log(`[${new Date().toLocaleTimeString()}] ⚡ Initiating Live Cloudflare Tunnel Auto-Start...`);
    isHealing = true;
    await healTunnel();
    isHealing = false;
  }
}

// Start Monitoring Loop
setInterval(monitorCycle, CHECK_INTERVAL_MS);
monitorCycle();
