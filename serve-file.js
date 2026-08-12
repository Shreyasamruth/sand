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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve Direct File Download
  const range = req.headers.range;

  if (range) {
    // Handle HTTP Range Requests for Resumable Downloads
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
    const chunksize = (end - start) + 1;

    const fileStream = fs.createReadStream(FILE_PATH, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${FILE_NAME}"`
    });

    fileStream.pipe(res);
  } else {
    // Full File Stream
    res.writeHead(200, {
      'Content-Length': totalSize,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${FILE_NAME}"`,
      'Accept-Ranges': 'bytes'
    });

    fs.createReadStream(FILE_PATH).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 DIRECT FILE SERVER RUNNING FOR YOUR 15 GB OVA`);
  console.log(`==================================================`);
  console.log(`Local URL:  http://localhost:${PORT}/download`);
  console.log(`File Name:  ${FILE_NAME}`);
  console.log(`File Size:  ${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  console.log(`==================================================\n`);
});
