/* Nabta: interactions */
(function(){
  // mobile menu
  var burger = document.querySelector('.burger');
  if(burger){ burger.addEventListener('click', function(){ document.body.classList.toggle('mobile-open'); }); }

  // scroll reveal
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('[data-r]').forEach(function(el,i){
    el.style.transitionDelay = (i%3)*0.06 + 's';
    io.observe(el);
  });

  // ---------------------------------------------------------------------------
  // cart: saved in localStorage so it survives page changes; the bag opens as a
  // drawer injected here, so no page markup needs to change
  // ---------------------------------------------------------------------------
  var KEY = 'nabta-cart', FREE_OVER = 35, DELIVERY = 2.5;
  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (err) { items = []; }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) {} }
  function jd(n){ return (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0) + ' JD'; }
  function count(){ return items.reduce(function(t, i){ return t + i.qty; }, 0); }
  function subtotal(){ return items.reduce(function(t, i){ return t + i.qty * i.price; }, 0); }
  function esc(t){ var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  var drawer = document.createElement('div');
  drawer.className = 'bag';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="bag-overlay" data-bag-close></div>' +
    '<aside class="bag-panel" role="dialog" aria-modal="true" aria-label="Your bag">' +
      '<div class="bag-head"><h3>Your bag</h3><button class="bag-x" data-bag-close aria-label="Close">&times;</button></div>' +
      '<div class="bag-body"></div>' +
    '</aside>';
  document.body.appendChild(drawer);
  var body = drawer.querySelector('.bag-body');
  var view = 'cart';

  function renderCount(){
    document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = count(); });
    document.querySelectorAll('.nav-icon').forEach(function(el){ el.setAttribute('data-count', count()); });
  }

  function render(){
    renderCount();
    if (view === 'done') return;
    if (!items.length) {
      body.innerHTML = '<div class="bag-empty"><p>Your bag is empty.</p><a href="shop.html" class="btn">Shop the range</a></div>';
      return;
    }
    var sub = subtotal(), del = sub >= FREE_OVER ? 0 : DELIVERY;
    var totals =
      '<div class="bag-totals">' +
        '<div><span>Subtotal</span><span>' + jd(sub) + '</span></div>' +
        '<div><span>Delivery</span><span>' + (del ? jd(del) : 'Free') + '</span></div>' +
        (del ? '<p class="bag-note">Add ' + jd(FREE_OVER - sub) + ' more for free delivery.</p>' : '') +
        '<div class="bag-total"><span>Total</span><span>' + jd(sub + del) + '</span></div>' +
      '</div>';
    if (view === 'checkout') {
      body.innerHTML =
        '<button class="bag-back" data-bag-view="cart">&larr; Back to bag</button>' +
        '<form class="bag-form" novalidate>' +
          '<div class="field"><label>Full name</label><input name="name" autocomplete="name" required></div>' +
          '<div class="field"><label>Phone</label><input name="phone" type="tel" autocomplete="tel" placeholder="07X XXX XXXX" required></div>' +
          '<div class="field"><label>City</label><select name="city"><option>Amman</option><option>Zarqa</option><option>Irbid</option><option>Madaba</option><option>Aqaba</option><option>Salt</option><option>Other</option></select></div>' +
          '<div class="field"><label>Address</label><textarea name="address" rows="2" autocomplete="street-address" placeholder="Area, street, building" required></textarea></div>' +
          '<div class="field"><label>Payment</label><select name="pay"><option>Cash on delivery</option><option>Card on delivery</option></select></div>' +
          totals +
          '<p class="bag-error" hidden>Please fill in your name, phone and address.</p>' +
          '<button class="btn bag-cta" type="submit">Place order &middot; ' + jd(sub + del) + '</button>' +
        '</form>';
      return;
    }
    body.innerHTML =
      '<ul class="bag-list">' + items.map(function(i, n){
        return '<li class="bag-item">' +
          (i.img ? '<img src="' + esc(i.img) + '" alt="">' : '<span class="bag-ph"></span>') +
          '<div class="bag-info"><p class="bag-name">' + esc(i.name) + '</p>' +
            (i.cat ? '<p class="bag-cat">' + esc(i.cat) + '</p>' : '') +
            '<div class="bag-qty"><button data-bag-dec="' + n + '" aria-label="Remove one">&minus;</button><span>' + i.qty + '</span><button data-bag-inc="' + n + '" aria-label="Add one">+</button></div>' +
          '</div>' +
          '<div class="bag-side"><span>' + jd(i.price * i.qty) + '</span><button class="bag-rm" data-bag-rm="' + n + '">Remove</button></div>' +
        '</li>';
      }).join('') + '</ul>' + totals +
      '<button class="btn bag-cta" data-bag-view="checkout">Checkout</button>';
  }

  function open(){ view = view === 'done' ? 'cart' : view; render(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function close(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (view === 'done') view = 'cart'; }

  function add(prod){
    var name = (prod.querySelector('h3') || {}).textContent || 'Product';
    var price = parseFloat(((prod.querySelector('.prod-price') || {}).textContent || '0').replace(/[^\d.]/g, '')) || 0;
    var img = prod.querySelector('.prod-media img');
    var cat = prod.querySelector('.prod-cat');
    var hit = items.filter(function(i){ return i.name === name; })[0];
    if (hit) hit.qty++;
    else items.push({ name: name, price: price, qty: 1, img: img ? img.getAttribute('src') : '', cat: cat ? cat.textContent : '' });
    save(); render();
  }

  document.addEventListener('click', function(e){
    var t = e.target;
    var addBtn = t.closest('.prod-add, [data-add]');
    if (addBtn) {
      e.preventDefault(); e.stopPropagation();
      var prod = addBtn.closest('.prod');
      if (prod) add(prod);
      addBtn.textContent = 'Added ✓';
      setTimeout(function(){ addBtn.textContent = 'Add to bag'; }, 1400);
      return;
    }
    if (t.closest('.nav-icon')) { e.preventDefault(); open(); return; }
    if (t.closest('[data-bag-close]')) { close(); return; }
    var v = t.closest('[data-bag-view]');
    if (v) { view = v.getAttribute('data-bag-view'); render(); return; }
    var inc = t.closest('[data-bag-inc]'), dec = t.closest('[data-bag-dec]'), rm = t.closest('[data-bag-rm]');
    if (inc) { items[+inc.getAttribute('data-bag-inc')].qty++; }
    else if (dec) { var d = +dec.getAttribute('data-bag-dec'); if (--items[d].qty < 1) items.splice(d, 1); }
    else if (rm) { items.splice(+rm.getAttribute('data-bag-rm'), 1); }
    else return;
    save(); render();
  });

  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });

  drawer.addEventListener('submit', function(e){
    e.preventDefault();
    var f = e.target, err = f.querySelector('.bag-error');
    var ok = ['name', 'phone', 'address'].every(function(n){ return f.elements[n].value.trim(); });
    if (!ok) { err.hidden = false; return; }
    var first = f.elements.name.value.trim().split(' ')[0];
    var order = 'NB-' + String(Date.now()).slice(-6);
    var total = subtotal() + (subtotal() >= FREE_OVER ? 0 : DELIVERY);
    items = []; save(); view = 'done'; renderCount();
    body.innerHTML = '<div class="bag-empty"><p class="eyebrow">Order ' + order + '</p>' +
      '<h3>Thank you, ' + esc(first) + '.</h3>' +
      '<p>We will call you on ' + esc(f.elements.phone.value.trim()) + ' to confirm delivery. Total ' + jd(total) + ', paid by ' + esc(f.elements.pay.value.toLowerCase()) + '.</p>' +
      '<button class="btn" data-bag-close>Continue shopping</button></div>';
  });

  render();

  // shop filters
  var filterBtns = document.querySelectorAll('.filters button');
  filterBtns.forEach(function(b){
    b.addEventListener('click', function(){
      filterBtns.forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.getAttribute('data-filter');
      document.querySelectorAll('.prod-grid .prod').forEach(function(p){
        var show = f === 'all' || p.getAttribute('data-cat') === f;
        p.style.display = show ? '' : 'none';
      });
    });
  });

  // forms
  document.querySelectorAll('form[data-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var note = f.querySelector('[data-note]');
      f.querySelectorAll('input,textarea,button,select').forEach(function(el){ el.disabled = true; });
      if(note){ note.style.display='block'; }
    });
  });

  // year
  var y = document.querySelector('[data-year]'); if(y){ y.textContent = new Date().getFullYear(); }
})();
