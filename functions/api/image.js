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

  const { imagePrompt, colors } = body;
  if (!imagePrompt || typeof imagePrompt !== 'string') {
    return jsonError('imagePrompt is required', 400);
  }

  if (!env.AI) {
    return jsonError('AI binding not configured', 500);
  }

  // Splice the color palette into the prompt by replacing the color references
  const finalPrompt = colors
    ? imagePrompt.replace(
        /(wearing .+?\. Shot)/i,
        (match) => match.replace(/\b(black|white|beige|cream|blue|red|green|yellow|pink|purple|brown|grey|gray|tan|camel|ivory|neutral|bold|pastel|colou?r\w*)\b/gi, '') + ` in a ${colors} color palette. Shot`
      )
    : imagePrompt;

  try {
    const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: finalPrompt,
      num_steps: 4,
    });

    // Workers AI returns { image: base64string }
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
