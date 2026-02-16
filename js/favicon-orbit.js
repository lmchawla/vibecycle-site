(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var S = 64, C = 32, R = 26, DR = 5.6;
  var FRAMES = 20;
  var canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  var ctx = canvas.getContext('2d');
  var head = document.head;
  var frames = [];

  for (var i = 0; i < FRAMES; i++) {
    var angle = -Math.PI / 2 + (Math.PI * 2 * i / FRAMES);

    ctx.clearRect(0, 0, S, S);

    ctx.beginPath();
    ctx.roundRect(0, 0, S, S, 14);
    ctx.fillStyle = '#0d1526';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(C, C, R, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e3050';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#e2e5eb';
    ctx.font = 'bold 36px Inter, -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('v', C, C + 3);

    ctx.beginPath();
    ctx.arc(C + R * Math.cos(angle), C + R * Math.sin(angle), DR, 0, Math.PI * 2);
    ctx.fillStyle = '#1868db';
    ctx.fill();

    frames.push(canvas.toDataURL('image/png'));
  }

  // Pre-build link elements to avoid DOM creation during animation
  var links = frames.map(function (url) {
    var el = document.createElement('link');
    el.rel = 'icon';
    el.type = 'image/png';
    el.href = url;
    return el;
  });

  var idx = 0;
  var current = document.querySelector('link[rel="icon"]');

  setInterval(function () {
    var next = links[idx];
    head.replaceChild(next, current);
    current = next;
    idx = (idx + 1) % FRAMES;
  }, 120);
})();
