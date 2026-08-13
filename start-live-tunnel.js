import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Launching Cloudflare Tunnel for Port 8080...');

const cloudflaredExe = path.resolve('cloudflared.exe');

const cf = spawn(cloudflaredExe, ['tunnel', '--url', 'http://127.0.0.1:8080', '--no-autoupdate'], {
  cwd: process.cwd()
});

function processOutput(data) {
  const text = data.toString();
  
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match) {
    const liveUrl = match[0];
    console.log(`\n==================================================`);
    console.log(`🎉 CLOUDFLARE LIVE TUNNEL ACTIVATED AT:`);
    console.log(`🔗 ${liveUrl}`);
    console.log(`==================================================\n`);

    const configPath = path.resolve('src/config.js');
    let content = fs.readFileSync(configPath, 'utf8');

    content = content.replace(
      /downloadUrl:\s*"[^"]*"/,
      `downloadUrl: "${liveUrl}"`
    );

    content = content.replace(
      /url:\s*"https:\/\/[^"]*(loca\.lt|trycloudflare\.com)[^"]*"/g,
      `url: "${liveUrl}"`
    );

    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`✅ Updated src/config.js with Cloudflare Tunnel URL: ${liveUrl}`);
  }
}

cf.stdout.on('data', processOutput);
cf.stderr.on('data', processOutput);

cf.on('close', (code) => {
  console.log(`Cloudflare process exited with code ${code}`);
});

// Keep process alive persistently
setInterval(() => {}, 30000);
