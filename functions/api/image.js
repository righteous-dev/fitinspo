// Cloudflare Pages Function — POST /api/image
// Generates a fashion editorial photo using Workers AI (flux-1-schnell).
// Requires the AI binding in wrangler.toml: [ai] binding = "AI"

// Age descriptors — must match generate.js
const AGE_DESCRIPTORS = {
  woman: {
    '15–25': '20-year-old woman',
    '26–35': 'woman in her early thirties',
    '36–45': 'woman in her early forties',
    '46–55': 'woman in her early fifties',
    '56–70': 'woman in her early sixties',
  },
  man: {
    '15–25': '20-year-old man',
    '26–35': 'man in his early thirties',
    '36–45': 'man in his early forties',
    '46–55': 'man in his early fifties',
    '56–70': 'man in his early sixties',
  },
  nonbinary: {
    '15–25': '20-year-old person',
    '26–35': 'person in their early thirties',
    '36–45': 'person in their early forties',
    '46–55': 'person in their early fifties',
    '56–70': 'person in their early sixties',
  },
};

function normaliseAge(raw) {
  const n = (raw || '').replace(/[-‒–—]/g, '–');
  return ['15–25','26–35','36–45','46–55','56–70'].includes(n) ? n : '26–35';
}

function getAgeDesc(gender, ageRange) {
  const byGender = AGE_DESCRIPTORS[gender] || AGE_DESCRIPTORS.woman;
  return byGender[ageRange] || byGender['26–35'];
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { imagePrompt, colors, skinTonePrompt, bodyTypePrompt, ageRange, gender } = body;
  if (!imagePrompt || typeof imagePrompt !== 'string') {
    return jsonError('imagePrompt is required', 400);
  }

  if (!env.AI) {
    return jsonError('AI binding not configured', 500);
  }

  const age = normaliseAge(ageRange);
  const gen = ['woman','man','nonbinary'].includes(gender) ? gender : 'woman';
  const ageDesc = getAgeDesc(gen, age);

  let prompt = imagePrompt;

  // 1. Override the model age — replace any "young woman/man/person" variant
  //    with the age-specific descriptor so Flux renders the right age.
  prompt = prompt.replace(
    /\b(?:young\s+)?(?:stylish\s+)?(?:young\s+)?(woman|man|person)\b/gi,
    (_, word) => {
      // Keep gender word from original; wrap in age descriptor
      return ageDesc;
    }
  );

  // 2. Inject skin tone and body type appearance
  const appearanceParts = [skinTonePrompt, bodyTypePrompt].filter(Boolean);
  if (appearanceParts.length > 0) {
    const appearance = appearanceParts.join(', with ');
    // Insert after "a [age desc] wearing" — before the outfit description
    const inserted = prompt.replace(
      new RegExp(`(${ageDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'),
      `$1 with ${appearance}`
    );
    // Fallback if pattern didn't match
    prompt = inserted !== prompt ? inserted : `A fashion editorial photo of a ${ageDesc} with ${appearance}. ` + prompt;
  }

  // 3. Splice colour palette
  if (colors) {
    prompt = prompt.replace(
      /(wearing .+?)\.\s*(Shot|Clean|Professional|Full)/i,
      (_, wearing, next) => {
        const stripped = wearing
          .replace(/\b(black|white|beige|cream|blue|red|green|yellow|pink|purple|brown|grey|gray|tan|camel|ivory|champagne|gold|coral|olive|navy|burgundy|emerald|cobalt|mustard)\b/gi, '')
          .replace(/\s{2,}/g, ' ').trim();
        return `${stripped} in a ${colors} color palette. ${next}`;
      }
    );
  }

  // 4. Reinforce editorial quality
  if (!prompt.includes('magazine quality')) {
    prompt += ', professional fashion editorial, high fashion magazine quality, sharp focus';
  }

  try {
    const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt,
      num_steps: 4,
    });

    if (!result?.image) {
      return jsonError('No image returned from AI', 502);
    }

    return new Response(JSON.stringify({ image: result.image }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });

  } catch (err) {
    return jsonError(err.message || 'Image generation failed', 502);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders() });
}

function jsonError(msg, status) {
  return Response.json({ error: msg }, { status });
}
