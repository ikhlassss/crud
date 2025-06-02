export default {
  async fetch(request, env) {
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

    if (request.method === 'GET' && pathname === '/products') {
      const result = await db.prepare('SELECT * FROM products ORDER BY id DESC').all();
      return new Response(JSON.stringify(result.results), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST' && pathname === '/products') {
      const { name, description, price, stock } = await getJsonBody();
      if (!name || price === undefined || stock === undefined) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
      }
      const result = await db
        .prepare('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)')
        .bind(name, description || '', price, stock)
        .run();
      return new Response(JSON.stringify({ id: result.lastInsertRowid }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    if ((request.method === 'PUT' || request.method === 'PATCH') && pathname.startsWith('/products/')) {
      const id = pathname.split('/')[2];
      if (!id) return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), { status: 400 });

      const { name, description, price, stock } = await getJsonBody();
      if (!name || price === undefined || stock === undefined) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
      }

      await db
        .prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?')
        .bind(name, description || '', price, stock, id)
        .run();

      return new Response(null, { status: 204 });
    }

    if (request.method === 'DELETE' && pathname.startsWith('/products/')) {
      const id = pathname.split('/')[2];
      if (!id) return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), { status: 400 });

      await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};
