const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.MASTER_PROXY_PORT || 8787;
const TARGET_BASE = 'https://trlm.pickitover.com/api';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isSupportedPath(pathname) {
  return pathname.startsWith('/api/master/') || pathname === '/api/auth/CRPsignup';
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxyRequest(req, res) {
  if (!isSupportedPath(req.url)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
    return;
  }

  const normalizedPath =
    TARGET_BASE.endsWith('/api') && req.url.startsWith('/api/')
      ? req.url.slice(4)
      : req.url;
  const targetUrl = new URL(`${TARGET_BASE}${normalizedPath}`);
  const requestBody = req.method === 'POST' ? await readRequestBody(req) : null;

  const upstream = https.request(
    targetUrl,
    {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...(requestBody ? { 'Content-Length': requestBody.length } : {})
      }
    },
    (upstreamRes) => {
      setCorsHeaders(res);
      res.writeHead(upstreamRes.statusCode || 500, {
        'Content-Type': upstreamRes.headers['content-type'] || 'application/json'
      });
      upstreamRes.pipe(res);
    }
  );

  upstream.on('error', (error) => {
    setCorsHeaders(res);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Proxy request failed', error: error.message }));
  });

  if (requestBody) {
    upstream.write(requestBody);
  }
  upstream.end();
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!['GET', 'POST'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  try {
    await proxyRequest(req, res);
  } catch (error) {
    setCorsHeaders(res);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Proxy server error', error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Master API proxy running on http://localhost:${PORT}`);
});
