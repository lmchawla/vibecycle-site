/* =========================================
   IntersectionObserver scroll reveals + Nav scroll background
   ========================================= */
(function() {
  'use strict';

  /* NAV: Scroll background */
  var nav = document.getElementById('nav');
  var scrolledClass = 'scrolled';
  var lastScroll = 0;
  function onScroll() {
    var y = window.scrollY;
    if (y > 40 && !nav.classList.contains(scrolledClass)) {
      nav.classList.add(scrolledClass);
    } else if (y <= 40 && nav.classList.contains(scrolledClass)) {
      nav.classList.remove(scrolledClass);
    }
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* REVEAL: IntersectionObserver for scroll reveals */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var reveals = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion) {
    reveals.forEach(function(el) { el.classList.add('reveal-hidden'); });
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-hidden');
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    reveals.forEach(function(el) { revealObserver.observe(el); });
  }
  /* ACCORDION: Observability layers collapse on <=768px */
  var obsLayers = document.querySelectorAll('.obs-layers-horizontal .obs-layer');
  obsLayers.forEach(function(layer) {
    layer.addEventListener('click', function() {
      if (window.innerWidth > 768) return;
      layer.classList.toggle('obs-layer--open');
    });
  });
})();
