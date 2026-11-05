/**
 * Cloudflare Worker: receive report and create GitHub Issue
 * Deploy this Worker and route report.evoladaily.com to it.
 * Set secret: GITHUB_TOKEN with repo:issues permission.
 * Optional: GITHUB_REPO = "sentiment001/juliusevola"
 */

const ALLOWED_ORIGINS = [
  'https://evoladaily.com',
  'https://www.evoladaily.com'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      if (!isAllowed) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    if (!isAllowed) {
      return new Response('Unauthorized origin', { status: 403 });
    }

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response('Invalid JSON', { status: 400 });
    }

    const title = (data.title || 'Inaccuracy report').slice(0, 200);
    const body = (data.body || '').slice(0, 10000);

    if (!title || !body) {
      return new Response('Missing title or body', { status: 400 });
    }

    const repo = env.GITHUB_REPO || 'sentiment001/juliusevola';
    const token = env.GITHUB_TOKEN;

    if (!token) {
      return new Response('Server not configured', { status: 500 });
    }

    const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'EvolaDaily-Report-Worker',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: body,
        labels: ['inaccuracy'],
      }),
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      console.error('GitHub error:', ghRes.status, errText);
      return new Response('Failed to create issue', { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
    });
  },
};
