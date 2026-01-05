export async function onRequestGet(context) {
    const { params, env } = context;
    const shortCode = params.id;

    const longUrl = await env.URL_SHORTENER_KV.get(shortCode);

    if (!longUrl) {
        return new Response('Not Found', { status: 404 });
    }

    // Optional: Log stats here later (e.g., increment a counter in another KV)

    return Response.redirect(longUrl, 301);
}