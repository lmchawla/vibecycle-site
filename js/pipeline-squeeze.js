/* =========================================
   Pipeline Squeeze — Looping three-phase animation
   Phase 1: Equal bars (initial state)
   Phase 2: Code shrinks, everything else swells (the problem)
   Phase 3: All bars compress evenly (the solution) + sparkles
   → loops back to Phase 1
   ========================================= */
(function() {
  'use strict';

  var wrap = document.getElementById('pipelineWrap');
  var pipeline = document.getElementById('pipeline');
  if (!wrap || !pipeline) return;

  var squeezedLabels = { 'stage-monitor': 'Monitor' };
  var resolvedLabels = { 'stage-monitor': 'Monitor (cont.)' };

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    pipeline.classList.add('squeezed', 'resolved');
    wrap.classList.add('phase-resolve');
    wrap.style.opacity = '1';
    applyLabels(resolvedLabels);
    return;
  }

  wrap.style.opacity = '0';
  wrap.style.transform = 'translateY(24px)';
  wrap.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

  function applyLabels(labelMap) {
    if (!labelMap) return;
    var stages = pipeline.querySelectorAll('.stage');
    stages.forEach(function(stage) {
      var classes = stage.className.split(' ');
      var stageKey = classes.find(function(c) { return c.startsWith('stage-') && c !== 'stage'; });
      if (stageKey && labelMap[stageKey]) {
        var labelEl = stage.querySelector('.stage-label');
        if (labelEl) labelEl.textContent = labelMap[stageKey];
      }
    });
  }

  var particleColors = ['#5ee8a0', '#4dabf5', '#a599ff', '#f5c542', '#ff6b8a', '#fff'];

  function spawnFireworks() {
    var bars = pipeline.querySelectorAll('.stage-bar');
    var wrapRect = wrap.getBoundingClientRect();

    bars.forEach(function(bar, barIndex) {
      var barRect = bar.getBoundingClientRect();
      var cx = barRect.left - wrapRect.left + barRect.width / 2;
      var cy = barRect.top - wrapRect.top;

      setTimeout(function() {
        var count = 14;
        for (var i = 0; i < count; i++) {
          var el = document.createElement('span');
          el.className = 'pipeline-particle';

          var color = particleColors[Math.floor(Math.random() * particleColors.length)];
          var size = 2 + Math.random() * 3;

          el.style.width = size + 'px';
          el.style.height = size + 'px';
          el.style.background = color;
          el.style.boxShadow = '0 0 ' + (size * 2) + 'px ' + color + ', 0 0 ' + (size * 4) + 'px ' + color;
          el.style.left = cx + 'px';
          el.style.top = cy + 'px';

          var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
          var dist = 40 + Math.random() * 80;
          var dx = Math.cos(angle) * dist;
          var dy = Math.sin(angle) * dist;
          var gravity = 30 + Math.random() * 20;

          wrap.appendChild(el);

          (function(elem, dx, dy, grav) {
            elem.animate([
              { transform: 'translate(0, 0) scale(1.5)', opacity: 1 },
              { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(1)', opacity: 0.9, offset: 0.3 },
              { transform: 'translate(' + (dx * 1.1) + 'px, ' + (dy + grav * 0.5) + 'px) scale(0.7)', opacity: 0.5, offset: 0.6 },
              { transform: 'translate(' + (dx * 1.15) + 'px, ' + (dy + grav) + 'px) scale(0.2)', opacity: 0 }
            ], { duration: 1800 + Math.random() * 800, easing: 'cubic-bezier(0, 0, 0.3, 1)', fill: 'forwards' });
          })(el, dx, dy, gravity);

          setTimeout(function(elem) {
            if (elem.parentNode) elem.parentNode.removeChild(elem);
          }, 3500, el);
        }
      }, barIndex * 80);
    });
  }

  function resetPipeline() {
    pipeline.classList.remove('squeezed', 'resolved');
    wrap.classList.remove('phase-baseline', 'phase-squeeze', 'phase-resolve');
    wrap.classList.add('phase-reset');
    applyLabels({ 'stage-monitor': 'Monitor' });
  }

  function runCycle() {
    wrap.classList.remove('phase-reset');

    // Phase 1: squeeze — code shrinks, everything else shoots up
    setTimeout(function() {
      applyLabels(squeezedLabels);
      pipeline.classList.add('squeezed');
      wrap.classList.add('phase-squeeze');
    }, 2000);

    // Phase 2: resolve
    setTimeout(function() {
      pipeline.classList.add('resolved');
      wrap.classList.remove('phase-squeeze');
      wrap.classList.add('phase-resolve');
      applyLabels(resolvedLabels);
      setTimeout(spawnFireworks, 400);
    }, 6000);

    setTimeout(function() {
      resetPipeline();
      setTimeout(runCycle, 3000);
    }, 11000);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        wrap.style.opacity = '1';
        wrap.style.transform = 'translateY(0)';
        setTimeout(function() {
          runCycle();
        }, 800);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(wrap);
})();
