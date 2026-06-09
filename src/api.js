// In dev mode, calls Anthropic directly (requires VITE_ANTHROPIC_KEY env var).
// In production, calls /api/* on the Cloudflare Pages Functions proxy.

import { RETAILERS } from './state.js';

// System prompt template — retailers and model word injected per request
function buildSystemPrompt(gender) {
  const retailers = RETAILERS[gender] || RETAILERS.woman;
  const modelWord = gender === 'man' ? 'man' : gender === 'nonbinary' ? 'person' : 'woman';
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

IMPORTANT: The imagePrompt must be a vivid detailed Stable Diffusion prompt. Replace [describe full outfit...] with actual specific visual details from the items. The "colors" value for "Original" must describe the actual colors of that outfit.

Search retailers: ${retailers.join(', ')}.
Return 2-3 outfits with 4-5 items each. Mix price points. Use realistic 2025 prices.`;
}

let _outfitCounter = 0;

export async function generateOutfits(prompt, ageRange = '26–35', gender = 'woman') {
  const isLocal = import.meta.env.DEV;

  if (isLocal) {
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
      body: JSON.stringify(buildPayload(prompt, ageRange, gender)),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    return assignIds(parseResponse(await res.json()));
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ageRange, gender }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  return assignIds(await res.json());
}

export async function generateImage(imagePrompt, colors, skinTonePrompt, bodyTypePrompt) {
  const res = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagePrompt, colors, skinTonePrompt, bodyTypePrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Image error ${res.status}`);
  }
  return (await res.json()).image;
}

function buildPayload(prompt, ageRange, gender) {
  return {
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: buildSystemPrompt(gender),
    messages: [{
      role: 'user',
      content: `Create complete outfit suggestions for: "${prompt}". Style specifically for a ${gender} aged ${ageRange} — use age-appropriate silhouettes, trends and styling that feel authentic to that life stage. Mix different retailers and price points. Include vivid imagePrompt and colorPalettes for each outfit.`,
    }],
  };
}

function parseResponse(data) {
  const txt = data.content?.find(b => b.type === 'text');
  if (!txt) throw new Error('No text response from AI');
  const raw = txt.text.replace(/```json|```/g, '').trim();
  const js = raw.indexOf('{'), je = raw.lastIndexOf('}');
  if (js === -1) throw new Error('Could not parse AI response');
  return JSON.parse(raw.slice(js, je + 1));
}

function assignIds(result) {
  result.outfits?.forEach(o => { o._id = ++_outfitCounter; });
  return result;
}
