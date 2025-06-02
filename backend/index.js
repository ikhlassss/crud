export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DATABASE_BINDING_NAME;

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === 'GET' && pathname === '/products') {
    // Get all products
    const products = await db.prepare('SELECT * FROM products').all();
    return new Response(JSON.stringify(products.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST' && pathname === '/products') {
    const { name, description, price, stock } = await request.json();
    const result = await db
      .prepare(
        'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)'
      )
      .bind(name, description, price, stock)
      .run();
    return new Response(JSON.stringify({ id: result.lastInsertRowid }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });
  }

  if ((request.method === 'PUT' || request.method === 'PATCH') && pathname.startsWith('/products/')) {
    const id = pathname.split('/')[2];
    const { name, description, price, stock } = await request.json();
    await db
      .prepare(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?'
      )
      .bind(name, description, price, stock, id)
      .run();
    return new Response(null, { status: 204 });
  }

  if (request.method === 'DELETE' && pathname.startsWith('/products/')) {
    const id = pathname.split('/')[2];
    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return new Response(null, { status: 204 });
  }

  return new Response('Not found', { status: 404 });
}
