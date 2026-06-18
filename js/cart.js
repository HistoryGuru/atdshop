// ── CART STATE ────────────────────────────────────────────
const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('griplock_cart') || '[]');

  const colorMap = {
    black: '#0a0a0a', white: '#e8e8e8', red: '#c62828',
    navy: '#283593', green: '#2e7d32'
  };

  function save() {
    localStorage.setItem('griplock_cart', JSON.stringify(items));
    renderCart();
    updateCount();
  }

  function add(product) {
    const existing = items.find(
      i => i.size === product.size && i.color === product.color
    );
    if (existing) {
      existing.qty += product.qty;
    } else {
      items.push({ ...product, id: Date.now() });
    }
    save();
    openCart();
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
  }

  function total() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function updateCount() {
    const count = items.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = count;
  }

  function renderCart() {
    const container = document.getElementById('cartItems');
    const footer    = document.getElementById('cartFooter');
    const totalEl   = document.getElementById('cartTotal');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
      footer.style.display = 'none';
      return;
    }

    footer.style.display = 'block';
    totalEl.textContent = `£${total().toFixed(2)}`;

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-thumb" style="background:${colorMap[item.color] || '#222'};">
          <svg viewBox="0 0 60 80" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
            <path d="M18,5 L42,5 L43,42 C43,42 52,47 53,57 C54,67 48,75 42,78 C36,81 24,81 18,78 C12,75 6,67 7,57 C8,47 17,42 17,42 Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          </svg>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">GRIPLOCK PRO</div>
          <div class="cart-item-meta">${item.color.toUpperCase()} · SIZE ${item.size} · Qty ${item.qty}</div>
        </div>
        <div class="cart-item-price">£${(item.price * item.qty).toFixed(2)}</div>
        <button class="cart-item-remove" onclick="Cart.remove(${item.id})" aria-label="Remove">✕</button>
      </div>
    `).join('');
  }

  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    updateCount();
    renderCart();

    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

    document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('checkoutBtn');
      btn.textContent = 'REDIRECTING...';
      btn.disabled = true;
      try {
        // POST line items to backend → get Stripe session URL
        const res = await fetch(`${CONFIG.API_URL}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });
        const { url } = await res.json();
        window.location.href = url;
      } catch (err) {
        alert('Something went wrong. Please try again.');
        btn.textContent = 'CHECKOUT';
        btn.disabled = false;
      }
    });
  });

  return { add, remove, openCart, closeCart, getItems: () => items };
})();
