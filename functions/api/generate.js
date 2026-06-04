// Cloudflare Pages Function — handles POST /api/generate
// Proxies to Anthropic so the API key never reaches the browser.
// Set ANTHROPIC_API_KEY as a Pages secret in the Cloudflare dashboard or via:
//   npx wrangler pages secret put ANTHROPIC_API_KEY --project-name fitinspo

const SYSTEM_PROMPT = `You are an expert fashion stylist with deep knowledge of 2025 trends.

Return ONLY valid JSON with no markdown fences, no preamble, no extra text:
{
  "trendNote": "1-sentence trend context for this aesthetic",
  "outfits": [
    {
      "vibe": "OUTFIT NAME IN CAPS",
      "tags": ["tag1", "tag2"],
      "description": "2-sentence style description with 2025 trend context",
      "imagePrompt": "A professional fashion editorial photo of a stylish young woman wearing [describe full outfit in detail: specific garments, fabrics, silhouettes, colors, shoes, bag, accessories]. Shot on a clean neutral background, soft studio lighting, full body shot, high fashion magazine quality, sharp focus, 4k",
      "colorPalettes": [
        { "label": "Original", "colors": "the default colors as described" },
        { "label": "Neutral Tones", "colors": "cream, beige, camel, ivory, soft white" },
        { "label": "Bold & Bright", "colors": "cobalt blue, deep red, mustard yellow, emerald green" },
        { "label": "All Black", "colors": "all black, jet black, obsidian, noir" }
      ],
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

IMPORTANT: The imagePrompt must be a vivid, detailed Stable Diffusion prompt describing the complete outfit visually. Replace [describe full outfit...] with actual specific details from the outfit items.
The colorPalettes array must always have exactly 4 entries with labels: "Original", "Neutral Tones", "Bold & Bright", "All Black". The "colors" value for "Original" should describe the actual colors of that specific outfit.

Search retailers: ASOS, Zara, H&M, Urban Outfitters, Revolve, Nordstrom, Mango, Free People, & Other Stories, COS, Uniqlo, Princess Polly, Abercrombie, PrettyLittleThing, Boohoo.
Return 2-3 outfits with 4-5 items each. Mix price points. Use realistic 2025 prices.`;

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return jsonError('prompt is required', 400);
  }
  if (prompt.length > 500) {
    return jsonError('prompt too long', 400);
  }

  const key = env.ANTHROPIC_API_KEY;
  if (!key) return jsonError('Server misconfiguration', 500);

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
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
  } catch (e) {
    return jsonError(`Malformed AI response: ${e.message} — snippet: ${raw.slice(js, js + 200)}`, 502);
  }

  return Response.json(result);
}

function jsonError(msg, status) {
  return Response.json({ error: msg }, { status });
}
