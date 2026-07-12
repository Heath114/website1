/* Nabta — interactions */
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

  // cart counter (decorative)
  var cartCount = document.querySelector('[data-cart-count]');
  var cart = 0;
  document.addEventListener('click', function(e){
    var add = e.target.closest('.prod-add, [data-add]');
    if(!add) return;
    e.preventDefault(); e.stopPropagation();
    cart++; if(cartCount){ cartCount.textContent = cart; }
    add.textContent = 'Added ✓';
    setTimeout(function(){ if(add.classList.contains('prod-add')) add.textContent='Add to bag'; }, 1400);
  });

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
