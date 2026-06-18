// CONFIG
var CONFIG = { API_URL: 'https://YOUR-BACKEND.onrender.com' };

var state = { color: 'black', size: 'L', qty: 1, price: 18.99 };
var colorNames = { black:'Black', white:'White', red:'Red', navy:'Navy', green:'Green' };

document.addEventListener('DOMContentLoaded', function() {

  // =========================
  // SIZE
  // =========================
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.size = btn.dataset.size;
    });
  });

  // =========================
  // COLOR
  // =========================
  function setColor(color) {
    state.color = color;

    document.getElementById('selectedColorLabel')
      ?.textContent = colorNames[color] || color;

    document.querySelectorAll('.swatch, .swatch-sm')
      .forEach(s => s.classList.toggle('active', s.dataset.color === color));
  }

  document.querySelectorAll('.swatch, .swatch-sm').forEach(btn => {
    btn.addEventListener('click', () => setColor(btn.dataset.color));
  });

  // =========================
  // QTY
  // =========================
  const qtyEl = document.getElementById('qtyValue');
  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    state.qty = Math.min(state.qty + 1, 10);
    if (qtyEl) qtyEl.textContent = state.qty;
  });

  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    state.qty = Math.max(state.qty - 1, 1);
    if (qtyEl) qtyEl.textContent = state.qty;
  });

  // =========================
  // CART
  // =========================
  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    Cart.add({
      name:'GRIPLOCK PRO',
      color:state.color,
      size:state.size,
      qty:state.qty,
      price:state.price
    });
  });

  document.getElementById('buyNowBtn')?.addEventListener('click', () => {
    Cart.add({
      name:'GRIPLOCK PRO',
      color:state.color,
      size:state.size,
      qty:state.qty,
      price:state.price
    });
    document.getElementById('checkoutBtn')?.click();
  });

  // =========================
  // EMAIL
  // =========================
  document.getElementById('emailForm')?.addEventListener('submit', e => {
    e.preventDefault();

    const email = e.target.querySelector('input').value;

    fetch(CONFIG.API_URL + '/subscribe', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ email })
    }).catch(()=>{});

    e.target.style.display='none';
    document.getElementById('emailConfirm').style.display='block';
  });

  // =========================
  // GALLERY DATA
  // =========================
  const images = Array.from(document.querySelectorAll('.carousel-slide img'));
  const track = document.querySelector('.carousel-track');
  const thumbs = document.querySelectorAll('.thumb');

  let index = 0;

  function updateGallery(i){
    index = i;

    images.forEach((img, idx)=>{
      img.style.display = idx === i ? 'block' : 'none';
    });

    thumbs.forEach((t, idx)=>{
      t.classList.toggle('active', idx === i);
    });
  }

  // init
  updateGallery(0);

  // =========================
  // BUTTONS
  // =========================
  document.getElementById('nextSlide')?.addEventListener('click', () => {
    updateGallery((index + 1) % images.length);
  });

  document.getElementById('prevSlide')?.addEventListener('click', () => {
    updateGallery((index - 1 + images.length) % images.length);
  });

  // =========================
  // THUMBNAILS
  // =========================
  thumbs.forEach((t, i)=>{
    t.addEventListener('click', ()=> updateGallery(i));
  });

  // =========================
  // SWIPE (mobile)
  // =========================
  let startX = 0;

  track?.addEventListener('touchstart', e=>{
    startX = e.touches[0].clientX;
  });

  track?.addEventListener('touchend', e=>{
    let diff = e.changedTouches[0].clientX - startX;

    if(diff > 50) updateGallery((index - 1 + images.length) % images.length);
    if(diff < -50) updateGallery((index + 1) % images.length);
  });

  // =========================
  // FULLSCREEN MODAL ZOOM
  // =========================
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');

  images.forEach(img=>{
    img.addEventListener('click', ()=>{
      modalImg.src = img.src;
      modal.style.display = 'flex';
    });
  });

  modal?.addEventListener('click', ()=>{
    modal.style.display = 'none';
  });

});
