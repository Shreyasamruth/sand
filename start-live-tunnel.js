import localtunnel from 'localtunnel';
import fs from 'fs';
import path from 'path';

(async () => {
  try {
    console.log('🚀 Connecting live cloud tunnel for port 8080...');
    const tunnel = await localtunnel({ port: 8080 });

    console.log(`\n==================================================`);
    console.log(`🎉 LIVE CLOUD TUNNEL ACTIVATED AT:`);
    console.log(`🔗 ${tunnel.url}`);
    console.log(`==================================================\n`);

    const configPath = path.resolve('src/config.js');
    let content = fs.readFileSync(configPath, 'utf8');

    content = content.replace(
      /downloadUrl:\s*"[^"]*"/,
      `downloadUrl: "${tunnel.url}"`
    );

    fs.writeFileSync(configPath, content, 'utf8');
    console.log(`✅ Updated src/config.js with live tunnel URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    console.error('❌ Error starting localtunnel:', err);
  }
})();
