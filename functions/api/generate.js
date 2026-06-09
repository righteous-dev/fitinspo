// Cloudflare Pages Function — handles POST /api/generate
// Set ANTHROPIC_API_KEY as a Pages secret.

const RETAILERS = {
  woman: {
    '15–25': ['ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Princess Polly', 'PrettyLittleThing', 'Boohoo', 'Revolve', 'Abercrombie', 'Free People', 'Mango', 'Uniqlo'],
    '26–35': ['ASOS', 'Zara', 'H&M', 'Revolve', 'Nordstrom', 'Mango', 'Free People', '& Other Stories', 'COS', 'Uniqlo', 'Abercrombie', 'Anthropologie'],
    '36–45': ['Nordstrom', 'Zara', 'Mango', '& Other Stories', 'COS', 'Uniqlo', 'Banana Republic', 'J.Crew', 'Reiss', 'Anthropologie', 'Club Monaco', 'Arket'],
    '46–55': ['Nordstrom', 'COS', 'Uniqlo', 'Banana Republic', 'J.Crew', 'Reiss', 'M&S', 'Hobbs', 'Ann Taylor', 'Talbots', 'Arket', 'Boden'],
    '56–70': ['Nordstrom', 'M&S', 'Hobbs', 'Eileen Fisher', 'Ann Taylor', 'Talbots', 'Boden', 'White House Black Market', 'J.Crew', 'Banana Republic', 'COS', 'Uniqlo'],
  },
  man: {
    '15–25': ['ASOS Men', 'H&M Men', 'Urban Outfitters Men', 'Zara Man', 'Pull&Bear', 'Nike', 'Adidas', 'Carhartt', 'Abercrombie Men', 'Represent', 'River Island Men'],
    '26–35': ['ASOS Men', 'Zara Man', 'H&M Men', 'Nordstrom Men', 'Uniqlo', 'Abercrombie Men', 'Nike', 'Adidas', 'COS Men', 'Next Men', 'Reiss Men'],
    '36–45': ['Nordstrom Men', 'Zara Man', 'COS Men', 'Uniqlo', 'Reiss Men', 'Banana Republic Men', 'J.Crew Men', 'Club Monaco Men', 'Ted Baker', 'Next Men'],
    '46–55': ['Nordstrom Men', 'Uniqlo', 'Banana Republic Men', 'J.Crew Men', 'Reiss Men', 'Ted Baker', 'M&S Men', 'Next Men', 'Brooks Brothers', 'COS Men'],
    '56–70': ['Nordstrom Men', 'M&S Men', 'Uniqlo', 'Banana Republic Men', 'J.Crew Men', 'Brooks Brothers', 'Boden Men', 'Ted Baker', 'Next Men', 'Marks & Spencer Men'],
  },
  nonbinary: {
    '15–25': ['ASOS', 'Urban Outfitters', 'H&M', 'Zara', 'Weekday', 'Collusion', 'Arket', 'Pull&Bear', 'Nike', 'Carhartt', 'COS'],
    '26–35': ['ASOS', 'COS', 'Uniqlo', 'Arket', 'Weekday', 'Zara', 'H&M', 'Nordstrom', 'Nike', '& Other Stories', 'Abercrombie'],
    '36–45': ['COS', 'Uniqlo', 'Arket', 'Nordstrom', 'Banana Republic', 'J.Crew', 'Weekday', '& Other Stories', 'Club Monaco', 'Reiss'],
    '46–55': ['COS', 'Uniqlo', 'Nordstrom', 'Banana Republic', 'J.Crew', 'Arket', 'M&S', 'Reiss', 'Boden', 'Ann Taylor'],
    '56–70': ['Nordstrom', 'COS', 'Uniqlo', 'M&S', 'Banana Republic', 'J.Crew', 'Boden', 'Eileen Fisher', 'Arket', 'Ann Taylor'],
  },
};

function getRetailers(gender, ageRange) {
  const byGender = RETAILERS[gender] || RETAILERS.woman;
  return byGender[ageRange] || byGender['26–35'];
}

// Age descriptors for Flux image prompts — specific ages produce more consistent results
const AGE_DESCRIPTORS = {
  woman: {
    '15–25': 'stylish 20-year-old woman',
    '26–35': 'stylish woman in her early thirties',
    '36–45': 'stylish woman in her early forties',
    '46–55': 'stylish woman in her early fifties',
    '56–70': 'stylish woman in her early sixties',
  },
  man: {
    '15–25': 'stylish 20-year-old man',
    '26–35': 'stylish man in his early thirties',
    '36–45': 'stylish man in his early forties',
    '46–55': 'stylish man in his early fifties',
    '56–70': 'stylish man in his early sixties',
  },
  nonbinary: {
    '15–25': 'stylish 20-year-old person',
    '26–35': 'stylish person in their early thirties',
    '36–45': 'stylish person in their early forties',
    '46–55': 'stylish person in their early fifties',
    '56–70': 'stylish person in their early sixties',
  },
};

function getAgeDescriptor(gender, ageRange) {
  const byGender = AGE_DESCRIPTORS[gender] || AGE_DESCRIPTORS.woman;
  return byGender[ageRange] || byGender['26–35'];
}

function buildSystemPrompt(gender, ageRange) {
  const retailers = getRetailers(gender, ageRange);
  const ageDesc = getAgeDescriptor(gender, ageRange);
  const modelDesc = `A professional fashion editorial photo of a ${ageDesc} wearing`;

  return `You are an expert fashion stylist with deep knowledge of 2025 trends.

## APPROVED RETAILERS — STRICT RULE
You may ONLY suggest items from these retailers. Every single item in every outfit MUST come from this list. Do not use any other brand or store under any circumstances:
${retailers.map(r => `- ${r}`).join('\n')}

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

Return 2-3 outfits with 4-5 items each. Mix price points from the approved retailer list only. Use realistic 2025 prices.`;
}

const VALID_GENDERS = ['woman', 'man', 'nonbinary'];

function normaliseAge(raw) {
  const n = (raw || '').replace(/[-‒–—]/g, '–');
  return ['15–25','26–35','36–45','46–55','56–70'].includes(n) ? n : '26–35';
}

// Budget tiers — must stay in sync with src/state.js
const BUDGET_TIERS = {
  thrifty:  'Total outfit budget is under $75. Every item must be budget-friendly and affordable. Keep individual item prices low, mostly under $25 each.',
  everyday: 'Total outfit budget is $75–$200. Mix affordable and mid-range pieces. Keep individual items mostly under $60.',
  premium:  'Total outfit budget is $200–$400. Mix mid-range and some premium pieces. Individual items can go up to $120.',
  luxury:   'This is a luxury outfit — no strict budget. Use premium and designer-adjacent pieces. Quality over price.',
  any:      '',
};

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const { prompt, ageRange, gender, budget } = body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return jsonError('prompt is required', 400);
  if (prompt.length > 500) return jsonError('prompt too long', 400);

  const age = normaliseAge(ageRange);
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
      system: buildSystemPrompt(gen, age),
      messages: [{
        role: 'user',
        content: `Create complete outfit suggestions for: "${prompt.trim()}". Style specifically for a ${gen} aged ${age} — use age-appropriate silhouettes, trends and styling. ${BUDGET_TIERS[budget] || ''} IMPORTANT: Every item must come from the approved retailer list in the system prompt. Do not suggest any other stores. Include vivid imagePrompt and colorPalettes for each outfit.`,
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

  // Post-process: remap any off-list brands to approved retailers
  result = enforceRetailers(result, getRetailers(gen, age));

  return Response.json(result);
}

// Build a search URL for a given retailer + item keywords
function buildSearchUrl(brand, itemName) {
  const q = encodeURIComponent(itemName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());
  const slug = brand.toLowerCase().replace(/[^a-z0-9]/g, '');

  const URLS = {
    'nordstrom':          `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${q}`,
    'nordstrommen':       `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${q}`,
    'ms':                 `https://www.marksandspencer.com/l/search/?q=${q}`,
    'msmen':              `https://www.marksandspencer.com/l/men/search/?q=${q}`,
    'hobbs':              `https://www.hobbs.co.uk/search?q=${q}`,
    'eileenfisher':       `https://www.eileenfisher.com/search?q=${q}`,
    'anntaylor':          `https://www.anntaylor.com/search?q=${q}`,
    'talbots':            `https://www.talbots.com/search?q=${q}`,
    'boden':              `https://www.boden.co.uk/en-gb/search?q=${q}`,
    'bodenwomen':         `https://www.boden.co.uk/en-gb/search?q=${q}`,
    'bodenmen':           `https://www.boden.co.uk/en-gb/search?q=${q}`,
    'whitehouseblackmarket': `https://www.whbm.com/search?q=${q}`,
    'jcrew':              `https://www.jcrew.com/search?Ntt=${q}`,
    'jcrewmen':           `https://www.jcrew.com/mens/search?Ntt=${q}`,
    'bananarepublic':     `https://bananarepublic.gap.com/browse/search.do?searchText=${q}`,
    'bananarepublicmen':  `https://bananarepublic.gap.com/browse/search.do?searchText=${q}&intdiv=mens`,
    'cos':                `https://www.cos.com/en_usd/search.html?q=${q}`,
    'cosmen':             `https://www.cos.com/en_usd/men/search.html?q=${q}`,
    'uniqlo':             `https://www.uniqlo.com/us/en/search?q=${q}`,
    'reiss':              `https://www.reiss.com/p/search/?q=${q}`,
    'reissmen':           `https://www.reiss.com/p/search/?q=${q}&gender=men`,
    'anthropologie':      `https://www.anthropologie.com/search?q=${q}`,
    'clubmonaco':         `https://www.clubmonaco.com/en/search?q=${q}`,
    'clubmonacomen':      `https://www.clubmonaco.com/en/men/search?q=${q}`,
    'arket':              `https://www.arket.com/en_gbp/search?q=${q}`,
    'weekday':            `https://www.weekday.com/en_gbp/search?q=${q}`,
    'collusion':          `https://www.asos.com/collusion/cat/?q=${q}`,
    'asos':               `https://www.asos.com/search/?q=${q}`,
    'asosmen':            `https://www.asos.com/men/search/?q=${q}`,
    'zara':               `https://www.zara.com/us/en/search?searchTerm=${q}`,
    'zaraman':            `https://www.zara.com/us/en/man-search?searchTerm=${q}`,
    'hm':                 `https://www.hm.com/en_us/search-results.html?q=${q}`,
    'hmmen':              `https://www.hm.com/en_us/men/search-results.html?q=${q}`,
    'nike':               `https://www.nike.com/w?q=${q}`,
    'adidas':             `https://www.adidas.com/us/search?q=${q}`,
    'carhartt':           `https://www.carhartt.com/search?q=${q}`,
    'pullbear':           `https://www.pullandbear.com/gb/search?searchTerm=${q}`,
    'riverislandmen':     `https://www.riverisland.com/men/search?q=${q}`,
    'nextmen':            `https://www.next.co.uk/search?w=${q}&intl=men`,
    'represent':          `https://representclo.com/search?type=product&q=${q}`,
    'tedbaker':           `https://www.tedbaker.com/uk/search?q=${q}`,
    'brooksbrothers':     `https://www.brooksbrothers.com/search?q=${q}`,
    'marksandspencermen': `https://www.marksandspencer.com/l/men/search/?q=${q}`,
    'abercrombie':        `https://www.abercrombie.com/shop/us/search?q=${q}`,
    'abercrombiemen':     `https://www.abercrombie.com/shop/us/mens-search?q=${q}`,
    'revolve':            `https://www.revolve.com/search/?q=${q}`,
    'freeople':           `https://www.freepeople.com/search/?q=${q}`,
    'mango':              `https://shop.mango.com/us/search?q=${q}`,
    'otherstories':       `https://www.stories.com/en_usd/search.html?q=${q}`,
    'urbanoutfitters':    `https://www.urbanoutfitters.com/search#q=${q}`,
    'urbanoutfittersmen': `https://www.urbanoutfitters.com/mens/search#q=${q}`,
    'princesspolly':      `https://www.princesspolly.com/search?q=${q}`,
    'prettylittlething':  `https://www.prettylittlething.com/search?q=${q}`,
    'boohoo':             `https://www.boohoo.com/search?q=${q}`,
  };

  const key = slug.replace(/[\s&'\.]/g, '').toLowerCase();
  return URLS[key] || `https://www.google.com/search?q=${encodeURIComponent(brand + ' ' + itemName)}`;
}

function enforceRetailers(result, approved) {
  if (!result?.outfits) return result;
  // Normalise approved list for comparison
  const approvedNorm = new Set(approved.map(r => r.toLowerCase().replace(/[^a-z0-9]/g, '')));

  result.outfits.forEach(outfit => {
    if (!outfit.items) return;
    outfit.items.forEach(item => {
      const norm = (item.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!approvedNorm.has(norm)) {
        // Pick a replacement — cycle through approved list deterministically
        const replacement = approved[Math.floor(Math.random() * approved.length)];
        item.brand = replacement;
        item.searchUrl = buildSearchUrl(replacement, item.name);
      }
    });
  });
  return result;
}

function jsonError(msg, status) {
  return Response.json({ error: msg }, { status });
}
