// Cloudflare Worker — proxies Anthropic API so the key never reaches the browser.
// Deploy alongside Cloudflare Pages via wrangler.toml functions config.

const SYSTEM_PROMPT = `You are an expert fashion stylist with deep knowledge of 2025 trends. Use web search to find REAL currently available products from real retailers.

Return ONLY valid JSON with no markdown fences, no preamble, no extra text:
{
  "trendNote": "1-sentence trend context for this aesthetic",
  "outfits": [
    {
      "vibe": "OUTFIT NAME IN CAPS",
      "tags": ["tag1", "tag2"],
      "description": "2-sentence style description with 2025 trend context",
      "items": [
        {
          "name": "Specific product name",
          "brand": "Brand or Retailer name",
          "category": "Top/Pants/Shoes/Bag/Accessory/Dress/Jacket/etc",
          "price": "$XX",
          "searchUrl": "https://www.retailer.com/search?q=product+keywords",
          "emoji": "single relevant emoji"
        }
      ],
      "totalEstimate": "$XXX"
    }
  ]
}

Search retailers: ASOS, Zara, H&M, Urban Outfitters, Revolve, Nordstrom, Mango, Free People, & Other Stories, COS, Uniqlo, Princess Polly, Abercrombie, PrettyLittleThing, Boohoo.
Return 2-3 outfits with 4-5 items each. Mix price points. Use realistic 2025 prices.`;

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      return handleGenerate(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleGenerate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return jsonError('prompt is required', 400);
  }
  if (prompt.length > 500) {
    return jsonError('prompt too long', 400);
  }

  const anthropicKey = env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return jsonError('Server misconfiguration', 500);
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Create complete outfit suggestions for: "${prompt.trim()}". Search for real products from actual retailers available right now in 2025. Mix different retailers and price points.`,
      }],
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return jsonError(err.error?.message || `Upstream error ${upstream.status}`, 502);
  }

  const data = await upstream.json();
  const txt = data.content?.find(b => b.type === 'text');
  if (!txt) return jsonError('No text response from AI', 502);

  const raw = txt.text.replace(/```json|```/g, '').trim();
  const js = raw.indexOf('{');
  const je = raw.lastIndexOf('}');
  if (js === -1) return jsonError('Could not parse AI response', 502);

  let result;
  try {
    result = JSON.parse(raw.slice(js, je + 1));
  } catch {
    return jsonError('Malformed AI response', 502);
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
