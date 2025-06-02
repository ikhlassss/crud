const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Bisa diganti domain frontend kamu untuk keamanan lebih ketat
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      // CORS preflight request
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const db = env.MANPROD_DB;

    async function getJsonBody() {
      try {
        return await request.json();
      } catch {
        return null;
      }
    }

    // GET /products
    if (request.method === 'GET' && pathname === '/products') {
      const result = await db.prepare('SELECT * FROM products ORDER BY id DESC').all();
      return new Response(JSON.stringify(result.results), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /products
    if (request.method === 'POST' && pathname === '/products') {
      const { name, description, price, stock } = await getJsonBody();
      if (!name || price === undefined || stock === undefined) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const result = await db
        .prepare('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)')
        .bind(name, description || '', price, stock)
        .run();

      return new Response(JSON.stringify({ id: result.lastInsertRowid }), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // PUT/PATCH /products/:id
    if ((request.method === 'PUT' || request.method === 'PATCH') && pathname.startsWith('/products/')) {
      const id = pathname.split('/')[2];
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const { name, description, price, stock } = await getJsonBody();
      if (!name || price === undefined || stock === undefined) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      await db
        .prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?')
        .bind(name, description || '', price, stock, id)
        .run();

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // DELETE /products/:id
    if (request.method === 'DELETE' && pathname.startsWith('/products/')) {
      const id = pathname.split('/')[2];
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Fallback 404
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders,
    });
  }
};
