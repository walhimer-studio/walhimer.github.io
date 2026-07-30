export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const expected = process.env.GALLERY_MOD_TOKEN;
  if (!expected) {
    return new Response(JSON.stringify({ ok: false, mode: 'disabled' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try {
    body = await req.json();
  } catch (_) { /* empty */ }

  const ok = typeof body.token === 'string' && body.token === expected;
  return new Response(JSON.stringify({ ok, mode: 'token' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
