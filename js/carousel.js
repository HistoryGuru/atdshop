/**
 * carousel.js — image carousel + zoom/lightbox for GRIPLOCK product page.
 *
 * Features:
 *  - Slide carousel with prev/next arrows, dot indicators, thumbnail strip
 *  - Touch/swipe support on the carousel
 *  - Zoom lightbox: scroll-wheel zoom, pinch-to-zoom, click-drag to pan
 *  - Keyboard navigation (← → arrows, Escape to close)
 *  - Clicking the main carousel image opens the lightbox
 */

(function () {
  'use strict';

  /* ── Config ── */
  var IMAGES = [
    'https://i.imgur.com/1kccEbq.png',
    'https://i.imgur.com/jIEQyFN.png',
    'https://i.imgur.com/DITrKXv.png'
  ];
  var SLIDE_COUNT = IMAGES.length;
  var MIN_ZOOM = 1;
  var MAX_ZOOM = 5;
  var ZOOM_STEP = 0.3;

  /* ── State ── */
  var currentIndex = 0;

  /* Lightbox state */
  var lbIndex = 0;
  var lbScale = 1;
  var lbOffsetX = 0;
  var lbOffsetY = 0;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var dragOriginOffsetX = 0;
  var dragOriginOffsetY = 0;

  /* Touch/swipe state for carousel */
  var touchStartX = 0;
  var touchStartY = 0;
  var touchDragging = false;

  /* Pinch state for lightbox */
  var lastPinchDist = 0;

  /* ── Elements ── */
  var track = document.getElementById('carouselTrack');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var zoomBtn = document.getElementById('carouselZoomBtn');
  var dots = document.querySelectorAll('.carousel-dot');
  var thumbs = document.querySelectorAll('.carousel-thumb');
  var carousel = document.getElementById('carousel');

  var zoomOverlay = document.getElementById('zoomOverlay');
  var zoomImg = document.getElementById('zoomImg');
  var zoomClose = document.getElementById('zoomClose');
  var zoomPrev = document.getElementById('zoomPrev');
  var zoomNext = document.getElementById('zoomNext');
  var zoomWrap = zoomImg ? zoomImg.parentElement : null;

  /* ── Carousel ── */

  function goTo(index, animate) {
    if (index < 0) index = SLIDE_COUNT - 1;
    if (index >= SLIDE_COUNT) index = 0;
    currentIndex = index;

    if (animate === false) {
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }
    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
    thumbs.forEach(function (t, i) {
      t.classList.toggle('active', i === currentIndex);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(currentIndex + 1); });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.stopPropagation();
      goTo(parseInt(dot.dataset.index, 10));
    });
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      goTo(parseInt(thumb.dataset.index, 10));
    });
  });

  /* Open lightbox on carousel click */
  if (carousel) {
    carousel.addEventListener('click', function () { openLightbox(currentIndex); });
  }
  if (zoomBtn) {
    zoomBtn.addEventListener('click', function (e) { e.stopPropagation(); openLightbox(currentIndex); });
  }

  /* Touch swipe on carousel */
  if (carousel) {
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      if (!touchDragging) return;
      touchDragging = false;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
      }
    }, { passive: true });
  }

  /* ── Lightbox ── */

  function openLightbox(index) {
    lbIndex = index;
    lbScale = 1;
    lbOffsetX = 0;
    lbOffsetY = 0;
    applyLbTransform(false);
    zoomImg.src = IMAGES[lbIndex];
    zoomOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    zoomOverlay.hidden = true;
    document.body.style.overflow = '';
  }

  function lbGoTo(index) {
    if (index < 0) index = SLIDE_COUNT - 1;
    if (index >= SLIDE_COUNT) index = 0;
    lbIndex = index;
    lbScale = 1;
    lbOffsetX = 0;
    lbOffsetY = 0;
    applyLbTransform(false);
    zoomImg.src = IMAGES[lbIndex];
  }

  function applyLbTransform(animate) {
    if (animate) {
      zoomImg.style.transition = 'transform 0.2s ease';
    } else {
      zoomImg.style.transition = 'none';
    }
    zoomImg.style.transform =
      'translate(' + lbOffsetX + 'px, ' + lbOffsetY + 'px) scale(' + lbScale + ')';
  }

  function clampOffsets() {
    if (!zoomWrap) return;
    var ww = zoomWrap.offsetWidth;
    var wh = zoomWrap.offsetHeight;
    var maxX = Math.max(0, (ww * lbScale - ww) / 2);
    var maxY = Math.max(0, (wh * lbScale - wh) / 2);
    lbOffsetX = Math.max(-maxX, Math.min(maxX, lbOffsetX));
    lbOffsetY = Math.max(-maxY, Math.min(maxY, lbOffsetY));
  }

  if (zoomClose) zoomClose.addEventListener('click', closeLightbox);
  if (zoomPrev) zoomPrev.addEventListener('click', function (e) { e.stopPropagation(); lbGoTo(lbIndex - 1); });
  if (zoomNext) zoomNext.addEventListener('click', function (e) { e.stopPropagation(); lbGoTo(lbIndex + 1); });

  /* Close on overlay background click */
  if (zoomOverlay) {
    zoomOverlay.addEventListener('click', function (e) {
      if (e.target === zoomOverlay) closeLightbox();
    });
  }

  /* Scroll wheel zoom — centered on cursor position */
  if (zoomWrap) {
    zoomWrap.addEventListener('wheel', function (e) {
      e.preventDefault();

      var rect = zoomWrap.getBoundingClientRect();
      // Mouse position relative to the wrap (0–1)
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      var prevScale = lbScale;
      var delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      lbScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, lbScale + delta));

      // Adjust offsets so the point under the cursor stays fixed.
      // When scale changes, the pixel at (mouseX, mouseY) in wrap-space
      // maps to a point in image-space. We want that image-space point
      // to remain under the cursor after scaling.
      var scaleRatio = lbScale / prevScale;
      lbOffsetX = mouseX - scaleRatio * (mouseX - lbOffsetX);
      lbOffsetY = mouseY - scaleRatio * (mouseY - lbOffsetY);

      if (lbScale === MIN_ZOOM) { lbOffsetX = 0; lbOffsetY = 0; }
      clampOffsets();
      applyLbTransform(false);
    }, { passive: false });
  }

  /* Mouse drag to pan */
  if (zoomWrap) {
    zoomWrap.addEventListener('mousedown', function (e) {
      if (lbScale <= 1) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOriginOffsetX = lbOffsetX;
      dragOriginOffsetY = lbOffsetY;
      zoomWrap.classList.add('grabbing');
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      lbOffsetX = dragOriginOffsetX + (e.clientX - dragStartX);
      lbOffsetY = dragOriginOffsetY + (e.clientY - dragStartY);
      clampOffsets();
      applyLbTransform(false);
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        zoomWrap && zoomWrap.classList.remove('grabbing');
      }
    });
  }

  /* Touch: pan + pinch-to-zoom */
  if (zoomWrap) {
    zoomWrap.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1 && lbScale > 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragOriginOffsetX = lbOffsetX;
        dragOriginOffsetY = lbOffsetY;
      }
    }, { passive: true });

    zoomWrap.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var rect = zoomWrap.getBoundingClientRect();
        var dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        // Midpoint between fingers in wrap-space
        var midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
        var midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

        var prevScale = lbScale;
        var ratio = dist / (lastPinchDist || dist);
        lbScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, lbScale * ratio));
        lastPinchDist = dist;

        // Keep the midpoint fixed under the fingers
        var scaleRatio = lbScale / prevScale;
        lbOffsetX = midX - scaleRatio * (midX - lbOffsetX);
        lbOffsetY = midY - scaleRatio * (midY - lbOffsetY);

        if (lbScale === MIN_ZOOM) { lbOffsetX = 0; lbOffsetY = 0; }
        clampOffsets();
        applyLbTransform(false);
      } else if (isDragging && e.touches.length === 1) {
        lbOffsetX = dragOriginOffsetX + (e.touches[0].clientX - dragStartX);
        lbOffsetY = dragOriginOffsetY + (e.touches[0].clientY - dragStartY);
        clampOffsets();
        applyLbTransform(false);
      }
    }, { passive: false });

    zoomWrap.addEventListener('touchend', function () {
      isDragging = false;
      lastPinchDist = 0;
    }, { passive: true });
  }

  /* Keyboard navigation */
  document.addEventListener('keydown', function (e) {
    if (!zoomOverlay || zoomOverlay.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbGoTo(lbIndex - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
  });

  /* Init */
  goTo(0, false);

})();
