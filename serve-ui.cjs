/**
 * Simple HTTP server to serve the INBATAMIZHAN P UI test page
 * This avoids CORS issues with file:// protocol
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const HTML_FILE = path.join(__dirname, 'test-inbatamizhan-ui.html');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = HTML_FILE;
  } else if (req.url === '/direct' || req.url === '/direct.html') {
    filePath = path.join(__dirname, 'test-direct-codechef.html');
  } else if (req.url === '/dashboard' || req.url === '/dashboard.html') {
    filePath = path.join(__dirname, 'inbatamizhan-dashboard.html');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>INBATAMIZHAN P UI Server</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%); }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #1e293b; margin-bottom: 20px; }
            .page-list { list-style: none; padding: 0; }
            .page-list li { margin: 10px 0; }
            .page-list a { display: block; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; text-decoration: none; color: #334155; transition: all 0.2s; }
            .page-list a:hover { background: #e2e8f0; transform: translateY(-1px); }
            .description { color: #64748b; font-size: 14px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 INBATAMIZHAN P UI Server</h1>
            <p style="color: #64748b; margin-bottom: 30px;">Choose a page to view INBATAMIZHAN P's CodeChef data:</p>
            <ul class="page-list">
              <li>
                <a href="/dashboard">
                  <strong>📊 Student Dashboard</strong>
                  <div class="description">Complete dashboard with beautiful grid layout and light colors</div>
                </a>
              </li>
              <li>
                <a href="/">
                  <strong>🔄 API-based UI Test</strong>
                  <div class="description">Real-time data fetching with refresh functionality</div>
                </a>
              </li>
              <li>
                <a href="/direct">
                  <strong>✅ Direct CodeChef Data</strong>
                  <div class="description">Verified data from live CodeChef profile</div>
                </a>
              </li>
            </ul>
            <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <strong>💡 Tip:</strong> All pages connect to the live backend API at <code>http://localhost:5000</code>
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading HTML file');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 INBATAMIZHAN P UI Server running at http://localhost:${PORT}`);
  console.log(`📊 Serving test UI for INBATAMIZHAN P CodeChef profile`);
  console.log(`🔗 Backend API: http://localhost:5000`);
  console.log(`✨ Available pages:`);
  console.log(`   • http://localhost:${PORT}/ - API-based UI Test`);
  console.log(`   • http://localhost:${PORT}/direct - Direct CodeChef Data`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down UI server...');
  server.close(() => {
    console.log('✅ UI server stopped');
    process.exit(0);
  });
});