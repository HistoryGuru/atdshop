// CONFIG: update API_URL after deploying to Render
var CONFIG = { API_URL: 'https://YOUR-BACKEND.onrender.com' };

var state = { color: 'black', size: 'L', qty: 1, price: 18.99 };
var colorNames = { black:'Black', white:'White', red:'Red', navy:'Navy', green:'Green' };

document.addEventListener('DOMContentLoaded', function() {

  // SIZE
  document.querySelectorAll('.size-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      state.size = btn.dataset.size;
    });
  });

  // COLOR
  function setColor(color) {
    state.color = color;
    var preview = document.getElementById('sockPreview');
    if (preview) preview.dataset.color = color;
    var lbl = document.getElementById('selectedColorLabel');
    if (lbl) lbl.textContent = colorNames[color] || color;
    document.querySelectorAll('.swatch, .swatch-sm').forEach(function(s) {
      s.classList.toggle('active', s.dataset.color === color);
    });
  }
  document.querySelectorAll('.swatch, .swatch-sm').forEach(function(btn) {
    btn.addEventListener('click', function() { setColor(btn.dataset.color); });
  });

  // QTY
  var qtyEl = document.getElementById('qtyValue');
  var plusBtn = document.getElementById('qtyPlus');
  var minusBtn = document.getElementById('qtyMinus');
  if (plusBtn) plusBtn.addEventListener('click', function() {
    state.qty = Math.min(state.qty + 1, 10);
    if (qtyEl) qtyEl.textContent = state.qty;
  });
  if (minusBtn) minusBtn.addEventListener('click', function() {
    state.qty = Math.max(state.qty - 1, 1);
    if (qtyEl) qtyEl.textContent = state.qty;
  });

  // ADD TO CART
  var addBtn = document.getElementById('addToCartBtn');
  if (addBtn) addBtn.addEventListener('click', function() {
    Cart.add({ name:'GRIPLOCK PRO', color:state.color, size:state.size, qty:state.qty, price:state.price });
    addBtn.textContent = 'ADDED TO BAG';
    addBtn.style.background = '#22c55e';
    setTimeout(function() { addBtn.textContent = 'ADD TO CART'; addBtn.style.background = ''; }, 1400);
  });

  // BUY NOW
  var buyBtn = document.getElementById('buyNowBtn');
  if (buyBtn) buyBtn.addEventListener('click', function() {
    Cart.add({ name:'GRIPLOCK PRO', color:state.color, size:state.size, qty:state.qty, price:state.price });
    var ckBtn = document.getElementById('checkoutBtn');
    if (ckBtn) ckBtn.click();
  });

  // EMAIL SIGNUP
  var emailForm = document.getElementById('emailForm');
  if (emailForm) emailForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = emailForm.querySelector('input[type="email"]').value;
    fetch(CONFIG.API_URL + '/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).catch(function() {});
    emailForm.style.display = 'none';
    var confirm = document.getElementById('emailConfirm');
    if (confirm) confirm.style.display = 'block';
  });
  document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".carousel-slide");
  const nextBtn = document.getElementById("nextSlide");
  const prevBtn = document.getElementById("prevSlide");

  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[i].classList.add("active");
  }

  if (nextBtn && prevBtn && slides.length) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    });
  }
});
});
