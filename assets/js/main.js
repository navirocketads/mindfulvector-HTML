/* ===========================================
   MindfulVector — Site JS
   Cart logic + UI interactions
   =========================================== */

(function () {
  'use strict';

  // ---------- CART STATE ----------
  const CART_KEY = 'mv_cart_v1';

  const PRODUCTS = {
    'creatine-gummies': {
      id: 'creatine-gummies',
      name: 'Creatine Gummies',
      flavor: 'Mixed Berry',
      icon: '🍬',
      price: 49.99,
      compareAt: 64.99,
      sku: 'MV-CG-60',
      servings: '60 gummies (30 servings)'
    }
  };

  const SUBSCRIPTION_DISCOUNT = 0.15;
  const FREE_SHIPPING_THRESHOLD = 0;
  const SHIPPING_FLAT = 0;

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function addToCart(productId, qty, subscription) {
    const cart = loadCart();
    const existing = cart.find(i => i.id === productId && i.subscription === subscription);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: productId, qty: qty, subscription: !!subscription });
    }
    saveCart(cart);
  }

  function removeFromCart(index) {
    const cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
  }

  function updateQty(index, qty) {
    const cart = loadCart();
    if (cart[index]) {
      cart[index].qty = Math.max(1, parseInt(qty, 10) || 1);
      saveCart(cart);
    }
  }

  function cartCount() {
    return loadCart().reduce((s, i) => s + i.qty, 0);
  }

  function lineTotal(item) {
    const p = PRODUCTS[item.id];
    if (!p) return 0;
    const base = p.price * item.qty;
    return item.subscription ? base * (1 - SUBSCRIPTION_DISCOUNT) : base;
  }

  function cartSubtotal() {
    return loadCart().reduce((s, i) => s + lineTotal(i), 0);
  }

  function updateCartBadge() {
    const badges = document.querySelectorAll('[data-cart-count]');
    const count = cartCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  // ---------- UI BOOT ----------
  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Mobile nav
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }

    // FAQ
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        item.classList.toggle('open');
      });
    });

    // Product page interactions
    initProductPage();
    initCartPage();
    initCheckoutPage();
    initContactForm();

    // Year in footer
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  });

  // ---------- PRODUCT PAGE ----------
  function initProductPage() {
    const form = document.querySelector('[data-add-to-cart]');
    if (!form) return;

    const qtyInput = form.querySelector('[data-qty-input]');
    const minusBtn = form.querySelector('[data-qty-minus]');
    const plusBtn = form.querySelector('[data-qty-plus]');

    if (minusBtn) minusBtn.addEventListener('click', () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.max(1, v - 1);
    });
    if (plusBtn) plusBtn.addEventListener('click', () => {
      const v = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.min(10, v + 1);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const productId = form.getAttribute('data-product-id');
      const qty = parseInt(qtyInput.value, 10) || 1;
      const sub = form.querySelector('input[name="purchase-type"]:checked');
      const subscription = sub && sub.value === 'subscription';
      addToCart(productId, qty, subscription);

      // Feedback
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = '✓ Added to cart';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1500);
    });

    // Thumbnail switcher (visual only)
    document.querySelectorAll('.product-thumb').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.product-thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
      });
    });
  }

  // ---------- CART PAGE ----------
  function initCartPage() {
    const container = document.querySelector('[data-cart-items]');
    if (!container) return;
    renderCart();

    function renderCart() {
      const cart = loadCart();

      if (cart.length === 0) {
        container.innerHTML = `
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p style="margin: 12px 0 24px;">Looks like you haven't added anything yet.</p>
            <a href="shop.html" class="btn btn-primary">Shop Creatine Gummies</a>
          </div>`;
        const summary = document.querySelector('[data-order-summary]');
        if (summary) summary.style.display = 'none';
        return;
      }

      let html = '';
      cart.forEach((item, idx) => {
        const p = PRODUCTS[item.id];
        if (!p) return;
        const subLabel = item.subscription
          ? '<span class="option-badge">Subscribe & Save</span>'
          : '<span class="option-sub">One-time purchase</span>';
        const total = lineTotal(item).toFixed(2);
        html += `
          <div class="cart-item">
            <div class="cart-item-img">${p.icon}</div>
            <div>
              <div class="cart-item-title">${p.name}</div>
              <div class="cart-item-meta">${p.flavor} · ${p.servings}</div>
              <div class="cart-item-meta">${subLabel}</div>
              <div style="display:flex; gap:12px; align-items:center; margin-top:10px;">
                <div class="qty-control" style="height:36px;">
                  <button type="button" data-qty-dec="${idx}">−</button>
                  <input type="number" min="1" value="${item.qty}" data-qty-update="${idx}" />
                  <button type="button" data-qty-inc="${idx}">+</button>
                </div>
                <a href="#" class="cart-item-remove" data-remove="${idx}">Remove</a>
              </div>
            </div>
            <div class="cart-item-price">$${total}</div>
          </div>`;
      });
      container.innerHTML = html;
      updateSummary();
      wireCartButtons();
    }

    function wireCartButtons() {
      container.querySelectorAll('[data-remove]').forEach(a => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          removeFromCart(parseInt(a.getAttribute('data-remove'), 10));
          renderCart();
        });
      });
      container.querySelectorAll('[data-qty-dec]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-qty-dec'), 10);
          const cart = loadCart();
          if (cart[idx] && cart[idx].qty > 1) {
            updateQty(idx, cart[idx].qty - 1);
            renderCart();
          }
        });
      });
      container.querySelectorAll('[data-qty-inc]').forEach(b => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.getAttribute('data-qty-inc'), 10);
          const cart = loadCart();
          if (cart[idx]) {
            updateQty(idx, cart[idx].qty + 1);
            renderCart();
          }
        });
      });
      container.querySelectorAll('[data-qty-update]').forEach(i => {
        i.addEventListener('change', () => {
          const idx = parseInt(i.getAttribute('data-qty-update'), 10);
          updateQty(idx, i.value);
          renderCart();
        });
      });
    }

    function updateSummary() {
      const sub = cartSubtotal();
      const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
      const tax = sub * 0.0; // displayed at checkout, region-based
      const total = sub + shipping + tax;
      const el = (sel) => document.querySelector(sel);
      if (el('[data-sum-subtotal]')) el('[data-sum-subtotal]').textContent = '$' + sub.toFixed(2);
      if (el('[data-sum-shipping]')) el('[data-sum-shipping]').textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
      if (el('[data-sum-total]')) el('[data-sum-total]').textContent = '$' + total.toFixed(2);
    }
  }

  // ---------- CHECKOUT PAGE ----------
  function initCheckoutPage() {
    const form = document.querySelector('[data-checkout-form]');
    if (!form) return;

    // Show order summary
    const itemsContainer = document.querySelector('[data-checkout-items]');
    if (itemsContainer) {
      const cart = loadCart();
      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; color:var(--color-muted);">Your cart is empty. <a href="shop.html">Shop now</a>.</p>';
      } else {
        let html = '';
        cart.forEach(item => {
          const p = PRODUCTS[item.id];
          if (!p) return;
          html += `
            <div class="summary-row">
              <span>${p.name} × ${item.qty}${item.subscription ? ' (Sub)' : ''}</span>
              <span>$${lineTotal(item).toFixed(2)}</span>
            </div>`;
        });
        itemsContainer.innerHTML = html;
      }

      const sub = cartSubtotal();
      const el = (sel) => document.querySelector(sel);
      if (el('[data-sum-subtotal]')) el('[data-sum-subtotal]').textContent = '$' + sub.toFixed(2);
      if (el('[data-sum-shipping]')) el('[data-sum-shipping]').textContent = 'FREE';
      if (el('[data-sum-total]')) el('[data-sum-total]').textContent = '$' + sub.toFixed(2);
    }

    // Payment option selection
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Submit (demo only — would integrate with payment processor)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.querySelector('[data-checkout-message]');
      if (msg) {
        msg.innerHTML = `
          <div class="alert alert-info">
            <strong>Demo Mode:</strong> This is a demonstration storefront. In a live environment, this step would securely process your payment through a PCI-compliant gateway (Stripe, PayPal, etc.). No information has been submitted.
          </div>`;
        msg.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ---------- CONTACT FORM ----------
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.querySelector('[data-contact-message]');
      if (msg) {
        msg.innerHTML = `
          <div class="alert alert-info">
            <strong>Thank you!</strong> Your message has been received. Our team will respond within 24 business hours.
          </div>`;
        form.reset();
        msg.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
})();
