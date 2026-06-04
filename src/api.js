// In dev mode, calls Anthropic directly (requires VITE_ANTHROPIC_KEY env var).
// In production, calls /api/generate on the Cloudflare Worker proxy.

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

export async function generateOutfits(prompt) {
  const isLocal = import.meta.env.DEV;

  if (isLocal) {
    // Dev: direct browser call (requires VITE_ANTHROPIC_KEY in .env.local)
    const key = import.meta.env.VITE_ANTHROPIC_KEY;
    if (!key) throw new Error('Add VITE_ANTHROPIC_KEY to .env.local for local dev');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(buildPayload(prompt)),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    return parseResponse(await res.json());
  }

  // Production: go through the Worker proxy (key never touches the browser)
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  return res.json();
}

function buildPayload(prompt) {
  return {
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Create complete outfit suggestions for: "${prompt}". Search for real products from actual retailers available right now in 2025. Mix different retailers and price points.`,
    }],
  };
}

function parseResponse(data) {
  const txt = data.content?.find(b => b.type === 'text');
  if (!txt) throw new Error('No text response from AI');
  const raw = txt.text.replace(/```json|```/g, '').trim();
  const js = raw.indexOf('{');
  const je = raw.lastIndexOf('}');
  if (js === -1) throw new Error('Could not parse AI response');
  return JSON.parse(raw.slice(js, je + 1));
}
