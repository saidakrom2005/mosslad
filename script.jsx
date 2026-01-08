const { useState, useEffect, useMemo } = React;

// Generate a large catalog of demo products
const PRODUCTS = Array.from({ length: 48 }).map((_, i) => {
  const id = i + 1;
  return {
    id,
    name: `Product ${id}`,
    price: +(Math.round((Math.random() * 90 + 10) * 100) / 100),
    image: `https://picsum.photos/seed/mosslad${id}/600/400`
  };
});

function currency(n){
  return `$${n.toFixed(2)}`;
}

function Header({ onToggleCart, cartCount }){
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">Mosslad Shop</div>
        <nav className="nav">
          <a href="#catalog">Catalog</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="cart-button" onClick={onToggleCart} aria-label="Open cart">
          <span className="icon">🛒</span>
          <span className="count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

function Footer(){
  return (
    <footer className="app-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} Mosslad Shop — All rights reserved.</div>
      </div>
    </footer>
  );
}

function ProductCard({ product, onAdd }){
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy"/>
      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="price">{currency(product.price)}</div>
        <button className="add-button" onClick={() => onAdd(product)}>Add to cart</button>
      </div>
    </div>
  );
}

function Cart({ open, onClose, items, onRemove, onChangeQty, onClear }){
  const subtotal = items.reduce((s,i)=>s + i.price * i.qty, 0);
  return (
    <aside className={"cart-drawer" + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="cart-header">
        <h2>Your Cart</h2>
        <button onClick={onClose} className="close">✕</button>
      </div>
      <div className="cart-body">
        {items.length === 0 && <div className="empty">Your cart is empty.</div>}
        {items.map(item => (
          <div className="cart-item" key={item.id}>
            <img src={`https://picsum.photos/seed/cart${item.id}/120/80`} alt={item.name} />
            <div className="ci-info">
              <div className="ci-name">{item.name}</div>
              <div className="ci-price">{currency(item.price)}</div>
              <div className="ci-qty">
                <button onClick={() => onChangeQty(item.id, item.qty - 1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => onChangeQty(item.id, item.qty + 1)}>+</button>
              </div>
            </div>
            <button className="ci-remove" onClick={() => onRemove(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="subtotal">Subtotal: <strong>{currency(subtotal)}</strong></div>
        <div className="cart-actions">
          <button className="clear" onClick={onClear}>Clear</button>
          <button className="checkout" onClick={() => alert('Checkout placeholder')}>Checkout</button>
        </div>
      </div>
    </aside>
  );
}

function App(){
  const [cart, setCart] = useState(() => {
    try{
      const raw = localStorage.getItem('mosslad_cart');
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(()=>{
    try{ localStorage.setItem('mosslad_cart', JSON.stringify(cart)); }catch(e){}
  }, [cart]);

  const cartCount = useMemo(()=>cart.reduce((s,i)=>s + i.qty, 0), [cart]);

  function addToCart(product){
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if(idx >= 0){
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [{ id: product.id, name: product.name, price: product.price, qty: 1 }, ...prev];
    });
    setDrawerOpen(true);
  }

  function removeFromCart(id){ setCart(prev => prev.filter(i=>i.id !== id)); }
  function changeQty(id, qty){
    setCart(prev => {
      if(qty <= 0) return prev.filter(i=>i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty } : i);
    });
  }
  function clearCart(){ setCart([]); }

  return (
    <div className="app-root">
      <Header onToggleCart={() => setDrawerOpen(o=>!o)} cartCount={cartCount} />

      <main className="main-content container">
        <section id="catalog" className="catalog">
          <h2>Product Catalog</h2>
          <p className="catalog-desc">Browse our large catalog and add items to your cart.</p>
          <div className="product-grid">
            {PRODUCTS.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <Cart open={drawerOpen} onClose={() => setDrawerOpen(false)} items={cart} onRemove={removeFromCart} onChangeQty={changeQty} onClear={clearCart} />
    </div>
  );
}

// Render
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
