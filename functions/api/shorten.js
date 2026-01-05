export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const longUrl = body.url;

    if (!longUrl) {
        return new Response('Missing URL', { status: 400 });
    }

    // Generate unique short code (7 chars alphanumeric)
    let shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        shortCode = Math.random().toString(36).substring(2, 9);
        const existing = await env.URL_SHORTENER_KV.get(shortCode);
        if (!existing) break;
        attempts++;
    }

    if (attempts === maxAttempts) {
        return new Response('Failed to generate unique code', { status: 500 });
    }

    // Store in KV
    await env.URL_SHORTENER_KV.put(shortCode, longUrl);

    // Return short URL (use request.url to get domain)
    const domain = new URL(request.url).origin;
    const shortUrl = `${domain}/s/${shortCode}`;

    return new Response(JSON.stringify({ shortUrl }), {
        headers: { 'Content-Type': 'application/json' }
    });
}