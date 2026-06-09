// Cloudflare Pages Function — handles POST /api/generate
// Set ANTHROPIC_API_KEY as a Pages secret.

const RETAILERS = {
  woman: [
    'ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Revolve', 'Nordstrom',
    'Mango', 'Free People', '& Other Stories', 'COS', 'Uniqlo',
    'Princess Polly', 'Abercrombie', 'PrettyLittleThing', 'Boohoo',
  ],
  man: [
    'ASOS Men', 'Zara Man', 'H&M Men', 'Urban Outfitters Men', 'Nordstrom Men',
    'Uniqlo', 'Abercrombie Men', 'Nike', 'Adidas', 'Carhartt',
    'Pull&Bear', 'River Island Men', 'Next Men', 'Represent', 'COS Men',
  ],
  nonbinary: [
    'ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Nordstrom', 'COS',
    'Uniqlo', 'Weekday', 'Arket', 'Abercrombie', 'Collusion',
    'Nike', 'Carhartt', 'Pull&Bear', '& Other Stories',
  ],
};

function buildSystemPrompt(gender) {
  const retailers = RETAILERS[gender] || RETAILERS.woman;
  const modelDesc = gender === 'man'
    ? 'A professional fashion editorial photo of a stylish young man wearing'
    : gender === 'nonbinary'
    ? 'A professional fashion editorial photo of a stylish young person wearing'
    : 'A professional fashion editorial photo of a stylish young woman wearing';

  return `You are an expert fashion stylist with deep knowledge of 2025 trends.

Return ONLY valid JSON with no markdown fences, no preamble, no extra text:
{
  "trendNote": "1-sentence trend context for this aesthetic",
  "outfits": [
    {
      "vibe": "OUTFIT NAME IN CAPS",
      "tags": ["tag1", "tag2"],
      "description": "2-sentence style description with 2025 trend context",
      "imagePrompt": "${modelDesc} [describe full outfit in detail: specific garments, fabrics, silhouettes, colors, shoes, bag/backpack, accessories]. Shot on a clean neutral background, soft studio lighting, full body shot, high fashion magazine quality, sharp focus, 4k",
      "colorPalettes": [
        { "label": "Original",      "colors": "the default colors of this specific outfit" },
        { "label": "Neutral Tones", "colors": "cream, beige, camel, ivory, soft white" },
        { "label": "Bold & Bright", "colors": "cobalt blue, deep red, mustard yellow, emerald green" },
        { "label": "All Black",     "colors": "all black, jet black, obsidian, noir" }
      ],
      "items": [
        {
          "name": "Specific product name",
          "brand": "Brand or Retailer name",
          "category": "Top/Pants/Shoes/Bag/Accessory/Dress/Jacket/Shorts/Hoodie/etc",
          "price": "$XX",
          "searchUrl": "https://www.retailer.com/search?q=product+keywords",
          "emoji": "single relevant emoji"
        }
      ],
      "totalEstimate": "$XXX"
    }
  ]
}

IMPORTANT: The imagePrompt must be a vivid detailed Stable Diffusion prompt. Replace [describe full outfit...] with actual specific visual details. The "colors" for "Original" must describe the actual outfit colors.

Search retailers: ${retailers.join(', ')}.
Return 2-3 outfits with 4-5 items each. Mix price points. Use realistic 2025 prices.`;
}

const VALID_GENDERS   = ['woman', 'man', 'nonbinary'];
const VALID_AGE_RANGES = ['15–25', '26–35', '36–45', '46–55', '56–70'];

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const { prompt, ageRange, gender } = body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return jsonError('prompt is required', 400);
  if (prompt.length > 500) return jsonError('prompt too long', 400);

  const age = VALID_AGE_RANGES.includes(ageRange) ? ageRange : '26–35';
  const gen = VALID_GENDERS.includes(gender) ? gender : 'woman';

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
      system: buildSystemPrompt(gen),
      messages: [{
        role: 'user',
        content: `Create complete outfit suggestions for: "${prompt.trim()}". Style specifically for a ${gen} aged ${age} — use age-appropriate silhouettes, trends and styling that feel authentic to that life stage. Mix different retailers and price points. Include vivid imagePrompt and colorPalettes for each outfit.`,
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
  const js = raw.indexOf('{'), je = raw.lastIndexOf('}');
  if (js === -1) return jsonError(`No JSON found`, 502);

  let result;
  try { result = JSON.parse(raw.slice(js, je + 1)); }
  catch (e) { return jsonError(`Malformed AI response: ${e.message}`, 502); }

  return Response.json(result);
}

function jsonError(msg, status) {
  return Response.json({ error: msg }, { status });
}
