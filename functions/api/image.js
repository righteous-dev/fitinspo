// Cloudflare Pages Function — POST /api/image
// Generates a fashion editorial photo using Workers AI (flux-1-schnell).
// Requires the AI binding in wrangler.toml: [ai] binding = "AI"

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const { imagePrompt, colors, skinTonePrompt, bodyTypePrompt } = body;
  if (!imagePrompt || typeof imagePrompt !== 'string') {
    return jsonError('imagePrompt is required', 400);
  }

  if (!env.AI) {
    return jsonError('AI binding not configured', 500);
  }

  // 1. Inject skin tone and body type into the model description.
  //    Claude writes "a stylish young woman wearing..." — we enrich it.
  let prompt = imagePrompt;

  const appearanceParts = [
    skinTonePrompt,    // e.g. "deep, rich brown skin tone"
    bodyTypePrompt,    // e.g. "plus-size, full-figured body"
  ].filter(Boolean);

  if (appearanceParts.length > 0) {
    // Insert appearance right after "a stylish young woman" (or similar opener)
    const appearance = appearanceParts.join(', with ');
    prompt = prompt.replace(
      /\b(a stylish (?:young )?woman)\b/i,
      `$1 with ${appearance}`
    );
    // Fallback: if pattern didn't match, prepend to the whole prompt
    if (prompt === imagePrompt) {
      prompt = `A fashion editorial photo of a woman with ${appearance}. ` + prompt;
    }
  }

  // 2. Splice color palette into the prompt
  if (colors) {
    prompt = prompt.replace(
      /(wearing .+?)\.\s*(Shot|Clean|Professional)/i,
      (_, wearing, next) => {
        // Strip existing color words to avoid conflicts
        const stripped = wearing.replace(
          /\b(black|white|beige|cream|blue|red|green|yellow|pink|purple|brown|grey|gray|tan|camel|ivory|champagne|gold|coral|olive|navy|burgundy|emerald|cobalt|mustard)\b/gi,
          ''
        ).replace(/\s{2,}/g, ' ').trim();
        return `${stripped} in a ${colors} color palette. ${next}`;
      }
    );
  }

  // 3. Always reinforce editorial quality at the end
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
