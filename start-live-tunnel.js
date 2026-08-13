import localtunnel from 'localtunnel';
import fs from 'fs';
import path from 'path';

(async () => {
  try {
    console.log('🚀 Connecting persistent live cloud tunnel for port 8080...');
    const tunnel = await localtunnel({ port: 8080 });

    const rawUrl = tunnel.url;
    const liveUrl = `${rawUrl}?bypass-tunnel-reminder=true`;

    console.log(`\n==================================================`);
    console.log(`🎉 PERMANENT LIVE CLOUD TUNNEL ACTIVATED AT:`);
    console.log(`🔗 ${liveUrl}`);
    console.log(`==================================================\n`);

    const configPath = path.resolve('src/config.js');
    let content = fs.readFileSync(configPath, 'utf8');

    content = content.replace(
      /downloadUrl:\s*"[^"]*"/,
      `downloadUrl: "${liveUrl}"`
    );

    content = content.replace(
      /url:\s*"https:\/\/[^"]*loca\.lt[^"]*"/g,
      `url: "${liveUrl}"`
    );

    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`✅ Updated src/config.js with live tunnel URL: ${liveUrl}`);

    tunnel.on('close', () => {
      console.log('❌ Tunnel closed by remote host.');
      process.exit(1);
    });

    tunnel.on('error', (err) => {
      console.error('⚠️ Tunnel error:', err);
    });

    // Keep process alive persistently so tunnel never closes
    setInterval(() => {}, 30000);

  } catch (err) {
    console.error('❌ Error starting localtunnel:', err);
  }
})();
