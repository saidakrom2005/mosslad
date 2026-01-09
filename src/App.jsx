import React, { useState, useEffect, useMemo } from 'react'

// Generate a large catalog of demo products
const PRODUCTS = Array.from({ length: 48 }).map((_, i) => {
  const id = i + 1
  return {
    id,
    name: `Product ${id}`,
    price: +(Math.round((Math.random() * 90 + 10) * 100) / 100),
    image: `https://picsum.photos/seed/mosslad${id}/600/400`
  }
})

function currency(n) {
  return `$${n.toFixed(2)}`
}

function Header({ onToggleCart, cartCount }) {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">Mosslad Shop</div>
        <nav className="nav">
          <a href="/" onClick={(e)=>{e.preventDefault(); if(typeof window !== 'undefined'){ window.history.pushState({},'', '/'); window.dispatchEvent(new Event('popstate')); }}}>Home</a>
          <a href="/catalog" onClick={(e)=>{e.preventDefault(); if(typeof window !== 'undefined'){ window.history.pushState({},'', '/catalog'); window.dispatchEvent(new Event('popstate')); }}}>Catalog</a>
          <a href="/about" onClick={(e)=>{e.preventDefault(); if(typeof window !== 'undefined'){ window.history.pushState({},'', '/'); window.dispatchEvent(new Event('popstate')); window.location.hash='about'; }}}>About</a>
          <a href="/contact" onClick={(e)=>{e.preventDefault(); if(typeof window !== 'undefined'){ window.history.pushState({},'', '/'); window.dispatchEvent(new Event('popstate')); window.location.hash='contact'; }}}>Contact</a>
        </nav>
        <button className="cart-button" onClick={onToggleCart} aria-label="Open cart">
          <span className="icon">🛒</span>
          <span className="count">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

function Hero(){
  return (
    <section id="home" className="hero">
      <div className="hero-content container">
        <h1>Welcome to Mosslad</h1>
        <p>Where every product is crafted with care — explore our catalog below.</p>
        <a href="#catalog" className="cta-button">Shop Now</a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} Mosslad Shop — All rights reserved.</div>
      </div>
    </footer>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="price">{currency(product.price)}</div>
        <button className="add-button" onClick={() => onAdd(product)}>
          Add to cart
        </button>
      </div>
    </div>
  )
}
function PopularSweets({ items, onAdd }){
  return (
    <section className="popular-sweets container">
      <h2>Popular Sweets</h2>
      <p className="catalog-desc">Our customers love these favorites.</p>
      <div className="product-grid">
        {items.map(p => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} />
        ))}
      </div>
    </section>
  )
}

function Cart({ open, onClose, items, onRemove, onChangeQty, onClear }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
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
  )
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('mosslad_cart')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [route, setRoute] = useState(() => window.location.pathname || '/')
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(to){
    if (to === window.location.pathname) return setRoute(to)
    window.history.pushState({}, '', to)
    setRoute(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    try { localStorage.setItem('mosslad_cart', JSON.stringify(cart)) } catch (e) {}
  }, [cart])

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])

  function addToCart(product) {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [{ id: product.id, name: product.name, price: product.price, qty: 1 }, ...prev]
    })
    setDrawerOpen(true)
  }

  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)) }
  function changeQty(id, qty) {
    setCart(prev => {
      if (qty <= 0) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, qty } : i)
    })
  }
  function clearCart() { setCart([]) }

  // small preview for home (contracted catalog)
  const PREVIEW_COUNT = 4
  const previewItems = PRODUCTS.slice(0, PREVIEW_COUNT)

  return (
    <div className="app-root">
      <Header navigate={navigate} onToggleCart={() => setDrawerOpen(o => !o)} cartCount={cartCount} />

      <main className="main-content">
        {route === '/' && (
          <>
            <Hero />
            <PopularSweets items={PRODUCTS.slice(0,6)} onAdd={addToCart} />

            <section id="catalog" className="catalog container">
              <h2>Featured Products</h2>
              <p className="catalog-desc">A curated preview of our catalog.</p>
              <div className="product-grid">
                {previewItems.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="add-button" onClick={() => navigate('/catalog')}>View More</button>
              </div>
            </section>

            <section className="our-story container" style={{ marginTop: '2.25rem' }}>
              <h2>Our Story</h2>
              <p className="lead">Mosslad Sweet Factory combines traditional recipes and modern quality standards to handcraft sweets loved by generations. We source premium ingredients, follow strict quality control, and package treats with care.</p>

              <div className="features-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="feature-card">
                  <h3>Quality Ingredients</h3>
                  <p>We select natural ingredients from trusted suppliers — no artificial fillers.</p>
                </div>
                <div className="feature-card">
                  <h3>Artisanal Craftsmanship</h3>
                  <p>Many of our sweets are still shaped and finished by hand by experienced confectioners.</p>
                </div>
                <div className="feature-card">
                  <h3>Eco Packaging</h3>
                  <p>We use recyclable and minimal packaging to reduce waste while keeping sweets fresh.</p>
                </div>
              </div>
            </section>

            <section id="about" className="about container">
              <h2>About Us</h2>
              <div className="about-content">
                <div className="about-text">
                  <p>Mosslad is dedicated to delivering high-quality goods with a focus on sustainability and craftsmanship.</p>
                  <p>Our team curates unique products and ensures every order is handled with care.</p>
                </div>
                <div className="about-image">
                  <img src="https://picsum.photos/seed/about/800/500" alt="About" />
                </div>
              </div>
            </section>

            <section id="contact" className="contact container">
              <h2>Contact Us</h2>
              <div className="contact-container">
                <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Thanks — message received (demo)') }}>
                  <input type="text" placeholder="Your Name" required />
                  <input type="email" placeholder="Your Email" required />
                  <textarea placeholder="Your Message" required></textarea>
                  <button type="submit" className="submit-button">Send Message</button>
                </form>
                <div className="contact-info">
                  <h3>Get in Touch</h3>
                  <p>Address: 123 Market Street</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: info@mosslad.example</p>
                </div>
              </div>
            </section>
          </>
        )}

        {route === '/catalog' && (
          <section className="catalog container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Full Catalog</h2>
              <div>
                <button className="add-button" onClick={() => navigate('/')}>Back Home</button>
              </div>
            </div>
            <p className="catalog-desc">All products are listed below.</p>
            <div className="product-grid">
              {PRODUCTS.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <Cart open={drawerOpen} onClose={() => setDrawerOpen(false)} items={cart} onRemove={removeFromCart} onChangeQty={changeQty} onClear={clearCart} />
    </div>
  )
}
