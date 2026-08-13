import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8080;
const FILE_PATH = path.resolve('HDP_2.6.5_virtualbox_180626.ova');
const FILE_NAME = 'HDP_2.6.5_virtualbox_180626.ova';

if (!fs.existsSync(FILE_PATH)) {
  console.error(`❌ Error: File not found at ${FILE_PATH}`);
  process.exit(1);
}

const stat = fs.statSync(FILE_PATH);
const totalSize = stat.size;

const server = http.createServer((req, res) => {
  // CORS Headers for high-concurrency browser downloads
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Ignore favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Common Headers for Download
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${FILE_NAME}"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  // Handle HEAD requests (Browsers/Download Managers check file specs first)
  if (req.method === 'HEAD') {
    res.writeHead(200, {
      ...headers,
      'Content-Length': totalSize
    });
    res.end();
    return;
  }

  // Handle HTTP Range Requests for Resumable Downloads
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${totalSize}`
      });
      res.end();
      return;
    }

    const chunksize = (end - start) + 1;
    const fileStream = fs.createReadStream(FILE_PATH, { 
      start, 
      end, 
      highWaterMark: 1024 * 1024 // 1MB buffer chunks for fast transfer
    });

    res.writeHead(206, {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Content-Length': chunksize
    });

    fileStream.pipe(res);

    req.on('close', () => {
      fileStream.destroy();
    });
  } else {
    // Full File Stream
    const fileStream = fs.createReadStream(FILE_PATH, { 
      highWaterMark: 1024 * 1024 // 1MB buffer chunks
    });

    res.writeHead(200, {
      ...headers,
      'Content-Length': totalSize
    });

    fileStream.pipe(res);

    req.on('close', () => {
      fileStream.destroy();
    });
  }
});

// Configure Server for 5000 Concurrent Connections & Extended Timeouts
server.maxConnections = 5000;
server.keepAliveTimeout = 300000; // 5 minutes keep-alive
server.headersTimeout = 305000;    // 305 seconds header timeout
server.requestTimeout = 0;         // Unlimited request timeout for 15GB streams

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 HIGH-CONCURRENCY FILE SERVER RUNNING (5000 MAX CONNS)`);
  console.log(`==================================================`);
  console.log(`Local URL:        http://localhost:${PORT}/download`);
  console.log(`File Name:        ${FILE_NAME}`);
  console.log(`File Size:        ${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  console.log(`Max Connections:  5000 concurrent sockets`);
  console.log(`KeepAlive Timeout: 300,000 ms (5 mins)`);
  console.log(`==================================================\n`);
});
