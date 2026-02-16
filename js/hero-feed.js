/* =========================================
   Hero board — timeline-based lifecycle demo
   Each event fires at a precise ms offset — no fixed cadence.
   ========================================= */
(function () {
  'use strict';

  var demo = document.querySelector('.hero-demo');
  if (!demo) return;

  var tickerText = document.getElementById('heroTickerText');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sidebar tile elements ---- */
  var sidebarDisc = document.getElementById('sidebarDiscovery');
  var sidebarDel = document.getElementById('sidebarDelivery');
  var sidebarOps = document.getElementById('sidebarOps');
  var sidebarAlerts = document.getElementById('sidebarAlerts');
  var sidebarMemory = document.getElementById('sidebarMemory');

  /* ---- Agent status elements ---- */
  var agentHarvesterStatus = document.getElementById('agentHarvesterStatus');
  var agentConductorStatus = document.getElementById('agentConductorStatus');
  var agentWatcherStatus = document.getElementById('agentWatcherStatus');
  var agentScannerStatus = document.getElementById('agentScannerStatus');
  var agentOptimizerStatus = document.getElementById('agentOptimizerStatus');
  var agentHarvesterDot = document.querySelector('#agentHarvester .demo-sa-dot');
  var agentConductorDot = document.querySelector('#agentConductor .demo-sa-dot');
  var agentWatcherDot = document.querySelector('#agentWatcher .demo-sa-dot');
  var agentScannerDot = document.querySelector('#agentScanner .demo-sa-dot');
  var agentOptimizerDot = document.querySelector('#agentOptimizer .demo-sa-dot');

  function setAgentStatus(statusEl, dotEl, text, hot) {
    if (statusEl) { statusEl.textContent = text; bumpEl(statusEl); }
    if (dotEl) {
      if (hot) {
        dotEl.classList.remove('bg-worker');
        dotEl.classList.add('active');
        dotEl.style.background = '';
      } else {
        dotEl.classList.remove('active');
        dotEl.classList.add('bg-worker');
      }
    }
  }

  function resetAgents() {
    setAgentStatus(agentHarvesterStatus, agentHarvesterDot, 'coll.', true);
    setAgentStatus(agentConductorStatus, agentConductorDot, 'build', true);
    setAgentStatus(agentWatcherStatus, agentWatcherDot, 'mon.', true);
    setAgentStatus(agentScannerStatus, agentScannerDot, 'scan', false);
    setAgentStatus(agentOptimizerStatus, agentOptimizerDot, 'opt.', false);
  }

  /* ---- Card data ---- */

  var feature = { human: { initials: 'AK', color: '#c07828' }, title: 'Payment webhooks v2', id: 'DEL-112', pri: 'high' };
  var hotfix  = { human: { initials: 'MR', color: '#6d5ff5' }, title: 'Webhook latency hotfix', id: 'OPS-087', pri: 'high' };

  var BG_CARDS = {
    research: [
      { human: { initials: 'JS', color: '#3eb07a' }, title: 'Mobile checkout drop-off', id: 'DIS-041', pri: 'med', stuck: 12 }
    ],
    spec: [],
    build: [
      { human: { initials: 'MR', color: '#6d5ff5' }, title: 'Dashboard redesign', id: 'DEL-104', pri: 'med', stuck: 8 }
    ],
    review: [],
    deploy: []
  };

  var FEATURE_TASKS = [
    { human: { initials: 'AK', color: '#c07828' }, title: 'Webhook endpoint handlers', id: 'DEL-112a', pri: 'high', routing: 'full' },
    { human: { initials: 'JS', color: '#3eb07a' }, title: 'Retry & dead letter queue', id: 'DEL-112b', pri: 'med', routing: 'full' },
    { human: { initials: 'MR', color: '#6d5ff5' }, title: 'Event schema validation', id: 'DEL-112c', pri: 'med', routing: 'fast' },
    { human: { initials: 'AK', color: '#c07828' }, title: 'Dashboard logs UI', id: 'DEL-112d', pri: 'med', routing: 'fast' }
  ];

  var HOTFIX_TASKS = [
    { human: { initials: 'MR', color: '#6d5ff5' }, title: 'Batch N+1 queries', id: 'OPS-087a', pri: 'high' },
    { human: { initials: 'MR', color: '#6d5ff5' }, title: 'Add query monitoring', id: 'OPS-087b', pri: 'med' }
  ];

  /* ---- DOM helpers ---- */

  function getColCards(name) {
    var col = demo.querySelector('[data-col="' + name + '"]');
    return col ? col.querySelector('.demo-col-cards') : null;
  }

  function ownerHtml(data, isBg) {
    if (data.human) {
      return '<span class="demo-card-avatar" style="background:' + data.human.color + ';">' + data.human.initials + '</span>' +
        '<span class="demo-card-agent-name">' + data.human.initials + '</span>';
    }
    return '<span class="demo-agent-dot' + (isBg ? '' : ' active') + '"></span>' +
      '<span class="demo-card-agent-name">' + data.agent + '</span>';
  }

  function createCardEl(data, isBg) {
    var el = document.createElement('div');
    el.className = 'demo-card' + (isBg ? ' demo-card--bg' : '') + (data.stuck ? ' demo-card--stuck' : '');
    el.setAttribute('data-card-id', data.id);
    var stuckBadge = data.stuck
      ? '<span class="demo-card-stuck mono">stuck ' + data.stuck + 'd</span>'
      : '';
    el.innerHTML =
      '<div class="demo-card-agent">' + ownerHtml(data, isBg) + '</div>' +
      '<div class="demo-card-title">' + data.title + '</div>' +
      '<div class="demo-card-meta">' +
        '<span class="demo-card-id mono">' + data.id + '</span>' +
        (data.pri ? '<span class="demo-card-priority ' + data.pri + '">' + (data.pri === 'high' ? 'High' : 'Med') + '</span>' : '') +
        stuckBadge +
      '</div>';
    return el;
  }

  function createMiniCardEl(data, parentId) {
    var el = document.createElement('div');
    el.className = 'demo-card demo-card--mini';
    el.setAttribute('data-card-id', data.id);
    el.setAttribute('data-parent-id', parentId);
    var routingBadge = data.routing
      ? '<span class="demo-card-routing ' + data.routing + '">' + (data.routing === 'fast' ? 'fast track' : 'deep review') + '</span>'
      : '';
    el.innerHTML =
      '<div class="demo-card-agent">' + ownerHtml(data, false) + '</div>' +
      '<div class="demo-card-title">' + data.title + '</div>' +
      '<div class="demo-card-meta">' +
        '<span class="demo-card-id mono">' + data.id + '</span>' +
        (data.pri ? '<span class="demo-card-priority ' + data.pri + '">' + (data.pri === 'high' ? 'High' : 'Med') + '</span>' : '') +
        routingBadge +
      '</div>';
    return el;
  }

  function showTicker(msg) {
    if (!tickerText) return;
    var span = document.createElement('span');
    span.textContent = msg;
    var oldSpans = tickerText.querySelectorAll('span');
    for (var i = 0; i < oldSpans.length; i++) {
      (function (el) {
        el.classList.remove('visible');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
      })(oldSpans[i]);
    }
    tickerText.appendChild(span);
    span.offsetHeight;
    span.classList.add('visible');
  }

  /* ---- Sidebar tile updates ---- */

  function bumpEl(el) {
    el.classList.remove('demo-tile-bump');
    el.offsetHeight;
    el.classList.add('demo-tile-bump');
  }

  function updateTiles(t) {
    if (t.disc !== undefined && sidebarDisc) { sidebarDisc.textContent = t.disc; bumpEl(sidebarDisc); }
    if (t.del  !== undefined && sidebarDel)  { sidebarDel.textContent  = t.del;  bumpEl(sidebarDel); }
    if (t.ops  !== undefined && sidebarOps)  { sidebarOps.textContent  = t.ops;  bumpEl(sidebarOps); }
    if (t.alerts !== undefined && sidebarAlerts) {
      sidebarAlerts.textContent = t.alerts;
      bumpEl(sidebarAlerts);
      if (t.alerts > 0) {
        sidebarAlerts.classList.remove('demo-sv-badge--zero');
      } else {
        sidebarAlerts.classList.add('demo-sv-badge--zero');
      }
    }
    if (t.memory !== undefined && sidebarMemory) { sidebarMemory.textContent = t.memory; bumpEl(sidebarMemory); }
  }

  function resetTiles() {
    if (sidebarDisc) sidebarDisc.textContent = '8';
    if (sidebarDel)  sidebarDel.textContent  = '14';
    if (sidebarOps)  sidebarOps.textContent  = '6';
    if (sidebarAlerts) { sidebarAlerts.textContent = '0'; sidebarAlerts.classList.add('demo-sv-badge--zero'); }
    if (sidebarMemory) sidebarMemory.textContent = '3';
    resetAgents();
  }

  /* ---- Monitor widget ---- */

  var monitorWidget = document.getElementById('monitorWidget');
  var monitorLabel = document.getElementById('monitorLabel');

  function setMonitor(state, text) {
    if (!monitorWidget) return;
    if (state === 'red') {
      monitorWidget.classList.add('alert');
    } else {
      monitorWidget.classList.remove('alert');
    }
    if (text && monitorLabel) monitorLabel.textContent = text;
  }

  /* ---- Animation primitives ---- */

  function cardEnter(colName, data, isBg) {
    var box = getColCards(colName);
    if (!box) return;
    var el = createCardEl(data, isBg);
    el.classList.add('demo-card--enter-from-left');
    box.insertBefore(el, box.firstChild);
    setTimeout(function () { el.classList.remove('demo-card--enter-from-left'); }, 350);
  }

  function cardExit(colName, cardId, direction) {
    var box = getColCards(colName);
    if (!box) return;
    var el = box.querySelector('.demo-card[data-card-id="' + cardId + '"]');
    if (!el) return;
    el.classList.add(direction === 'up' ? 'demo-card--exit-done' : 'demo-card--exit-right');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380);
  }

  function fanOut(colName, tasks, parentId, spawnLabel) {
    var box = getColCards(colName);
    if (!box) return;
    for (var i = 0; i < tasks.length; i++) {
      (function (taskData, delay) {
        setTimeout(function () {
          var card = createMiniCardEl(taskData, parentId);
          card.classList.add('demo-card--enter-new');
          box.appendChild(card);
          setTimeout(function () { card.classList.remove('demo-card--enter-new'); }, 400);
        }, delay);
      })(tasks[i], i * 120);
    }
  }

  function fanIn(colName, parentId, cb) {
    var box = getColCards(colName);
    if (!box) { if (cb) cb(); return; }
    var minis = box.querySelectorAll('.demo-card--mini[data-parent-id="' + parentId + '"]');
    for (var i = 0; i < minis.length; i++) {
      (function (el, delay) {
        setTimeout(function () {
          el.classList.add('demo-card--exit-done');
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380);
        }, delay);
      })(minis[i], i * 80);
    }
    var wait = minis.length * 80 + 400;
    if (cb) setTimeout(cb, wait);
  }

  function addSpawnBadge(colName, cardId, label) {
    var box = getColCards(colName);
    if (!box) return;
    var el = box.querySelector('.demo-card[data-card-id="' + cardId + '"]');
    if (!el) return;
    var badge = document.createElement('div');
    badge.className = 'demo-card-spawn';
    badge.textContent = label;
    el.appendChild(badge);
    el.classList.add('demo-card--spawning');
  }

  /* ---- Populate / Reset ---- */

  function populateInitial() {
    var cols = ['research', 'spec', 'build', 'review', 'deploy'];
    for (var i = 0; i < cols.length; i++) {
      var c = getColCards(cols[i]);
      if (c) c.innerHTML = '';
      var bgList = BG_CARDS[cols[i]];
      if (c && bgList) {
        for (var j = 0; j < bgList.length; j++) {
          if (approvedCards[bgList[j].id]) continue;
          c.appendChild(createCardEl(bgList[j], true));
        }
      }
    }
    var specBox = getColCards('spec');
    if (specBox) specBox.insertBefore(createCardEl(feature, false), specBox.firstChild);
    setMonitor('green', 'API response times');
  }

  function resetBoard() {
    clearNudgeTimers();
    nudgeActive = false;
    nudgeResolved = false;

    var all = demo.querySelectorAll('.demo-col-cards .demo-card');
    for (var i = 0; i < all.length; i++) all[i].classList.add('demo-card--exit-done');
    setTimeout(function () {
      populateInitial();
      setMonitor('green', 'API response times');
      resetTiles();
    }, 500);
  }

  /*
    Timeline (ms from cycle start):

    0      Spec → Build: spawn badge, fan-out 4 tasks
    600    Source card exits Spec
    2400   Fan-in → merged card lands in Build
    3200   Build → Review
    4200   Review → Deploy
    5400   Deploy → exit (feature done)
    5700   Monitor goes RED, alerts spike
    7400   Hotfix fan-out into Build (2 tasks)
    9000   Fan-in → merged card lands in Build
    9800   Build → Review
    10600  Review → Deploy
    11800  Deploy → exit + Monitor GREEN + alerts 0
    15500  Reset → loop
  */
  var CYCLE_LENGTH = 15500;
  var timers = [];

  function schedule(delay, fn) {
    timers.push(setTimeout(fn, delay));
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function runCycle() {
    clearTimers();
    tryNudge();

    /* === Phase 1: Feature ships === */

    // 0ms — Spec → Build fan-out
    schedule(0, function () {
      showTicker('Shape Crafter wrote PRD — matched 3 past webhook specs, reused retry pattern');
      updateTiles({ del: 15, disc: 9 });
      addSpawnBadge('spec', 'DEL-112', '4 tasks routed → 2 fast, 2 deep');
      setAgentStatus(agentHarvesterStatus, agentHarvesterDot, 'spec', true);
      setAgentStatus(agentConductorStatus, agentConductorDot, 'route', true);
    });
    schedule(400, function () {
      fanOut('build', FEATURE_TASKS, 'DEL-112');
    });
    schedule(600, function () {
      cardExit('spec', 'DEL-112', 'right');
    });

    // 2400ms — Fan-in → merged card lands in Build
    schedule(2400, function () {
      showTicker('Build Conductor: 12/12 tasks complete. Stored batch-query pattern for reuse.');
      updateTiles({ memory: 4 });
      setAgentStatus(agentConductorStatus, agentConductorDot, 'merge', true);
      setAgentStatus(agentScannerStatus, agentScannerDot, 'cov.', true);
      fanIn('build', 'DEL-112', function () {
        cardEnter('build', feature);
      });
    });

    // 3200ms — Build → Review
    schedule(3200, function () {
      cardExit('build', 'DEL-112', 'right');
    });
    schedule(3500, function () {
      cardEnter('review', feature);
    });

    // 4200ms — Review → Deploy
    schedule(4200, function () {
      showTicker('Quality Sentinel: 94% coverage, all gates green, deploying canary at 5%');
      setAgentStatus(agentConductorStatus, agentConductorDot, 'deploy', true);
      setAgentStatus(agentScannerStatus, agentScannerDot, 'pass', true);
      setAgentStatus(agentHarvesterStatus, agentHarvesterDot, 'coll.', true);
      cardExit('review', 'DEL-112', 'right');
    });
    schedule(4500, function () {
      cardEnter('deploy', feature);
    });

    // 5400ms — Deploy → exit
    schedule(5400, function () {
      showTicker('Rollout Controller: canary 5%, 25%, 100%. Webhooks v2 is live.');
      updateTiles({ del: 14, disc: 10 });
      setAgentStatus(agentConductorStatus, agentConductorDot, 'done', true);
      setAgentStatus(agentScannerStatus, agentScannerDot, 'scan', false);
      cardExit('deploy', 'DEL-112', 'up');
    });

    // 5700ms — Deploy caused a spike, monitor goes red
    schedule(5700, function () {
      showTicker('Health Watcher: webhook p99 spiking to 800ms. Investigating...');
      updateTiles({ alerts: 3 });
      setMonitor('red', 'Webhook p99 spike: 800ms');
      setAgentStatus(agentWatcherStatus, agentWatcherDot, 'ALERT', true);
      setAgentStatus(agentConductorStatus, agentConductorDot, 'idle', false);
    });

    /* === Phase 3: Hotfix ships === */

    // 7400ms — Hotfix fan-out directly into Build
    schedule(7400, function () {
      showTicker('Found matching fix pattern from last quarter. Applying stored solution.');
      updateTiles({ ops: 7, memory: 5 });
      setAgentStatus(agentConductorStatus, agentConductorDot, 'fix', true);
      setAgentStatus(agentWatcherStatus, agentWatcherDot, 'triage', true);
      setAgentStatus(agentOptimizerStatus, agentOptimizerDot, 'diag.', true);
      fanOut('build', HOTFIX_TASKS, 'OPS-087');
    });

    // 9000ms — Fan-in → merged card lands in Build
    schedule(9000, function () {
      showTicker('Build Conductor: queries batched, p99 fixed, pushing to Review');
      setAgentStatus(agentConductorStatus, agentConductorDot, 'merge', true);
      setAgentStatus(agentOptimizerStatus, agentOptimizerDot, 'opt.', false);
      fanIn('build', 'OPS-087', function () {
        cardEnter('build', hotfix);
      });
    });

    // 9800ms — Build → Review
    schedule(9800, function () {
      cardExit('build', 'OPS-087', 'right');
    });
    schedule(10100, function () {
      cardEnter('review', hotfix);
    });

    // 10600ms — Review → Deploy
    schedule(10600, function () {
      showTicker('Quality Sentinel: hotfix verified, all checks pass, deploying canary');
      setAgentStatus(agentConductorStatus, agentConductorDot, 'deploy', true);
      setAgentStatus(agentScannerStatus, agentScannerDot, 'cov.', true);
      cardExit('review', 'OPS-087', 'right');
    });
    schedule(10900, function () {
      cardEnter('deploy', hotfix);
    });

    // 11800ms — Deploy → exit + Monitor goes green
    schedule(11800, function () {
      showTicker('Hotfix deployed. Pattern confirmed effective, stored with 95% confidence.');
      updateTiles({ del: 14, ops: 6, alerts: 0, memory: 6, disc: 8 });
      cardExit('deploy', 'OPS-087', 'up');
      setMonitor('green', 'API response times nominal');
      setAgentStatus(agentWatcherStatus, agentWatcherDot, 'ok', true);
      setAgentStatus(agentConductorStatus, agentConductorDot, 'done', true);
      setAgentStatus(agentScannerStatus, agentScannerDot, 'scan', false);
    });

    // 13000ms — Background worker surfaces work
    schedule(13000, function () {
      showTicker('Perf Optimizer: consolidated 3 redundant API calls, saving 120ms');
      setAgentStatus(agentOptimizerStatus, agentOptimizerDot, 'done', true);
      setAgentStatus(agentWatcherStatus, agentWatcherDot, 'mon.', true);
      setAgentStatus(agentConductorStatus, agentConductorDot, 'idle', false);
    });

    /* === Reset and loop === */

    schedule(CYCLE_LENGTH, function () {
      resetBoard();
      schedule(1200, runCycle);
    });
  }

  /* ---- Stuck-card nudge system (parallel to main loop) ---- */

  var nudgeActive = false;
  var nudgeResolved = false;
  var approvedCards = {};
  var nudgeTimerIds = [];

  var CURSOR_SVG = '<svg width="16" height="20" viewBox="0 0 16 20" fill="none">' +
    '<path d="M1.5 1L13 9l-5 1.2L10.5 18l-3-1.5L5 10.5 1.5 12.5V1z" ' +
    'fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/></svg>';

  function nSched(delay, fn) {
    nudgeTimerIds.push(setTimeout(fn, delay));
  }
  function clearNudgeTimers() {
    for (var i = 0; i < nudgeTimerIds.length; i++) clearTimeout(nudgeTimerIds[i]);
    nudgeTimerIds = [];
  }

  function tryNudge() {
    nudgeResolved = false;
    if (nudgeActive || approvedCards['DIS-041']) return;
    if (window.innerWidth < 768) return;
    nSched(6500, function () { startNudge(); });
  }

  function startNudge() {
    if (nudgeActive || nudgeResolved) return;
    var card = demo.querySelector('.demo-card[data-card-id="DIS-041"]');
    if (!card) return;

    nudgeActive = true;

    /* Phase 1 — highlight */
    card.classList.add('demo-card--nudge');

    /* Phase 2 — overlay with single action */
    nSched(700, function () {
      var overlay = document.createElement('div');
      overlay.className = 'demo-nudge-overlay';

      var label = document.createElement('div');
      label.className = 'demo-nudge-label mono';
      label.textContent = 'Stuck 12 days';

      var btn = document.createElement('button');
      btn.className = 'demo-nudge-btn demo-nudge-btn--primary';
      btn.textContent = 'Route to Spec \u2192';

      var cursor = document.createElement('div');
      cursor.className = 'demo-nudge-cursor';
      cursor.innerHTML = CURSOR_SVG;

      overlay.appendChild(label);
      overlay.appendChild(btn);
      overlay.appendChild(cursor);
      card.appendChild(overlay);

      cursor.style.top = '80%';
      cursor.style.left = '70%';
      overlay.offsetHeight;
      overlay.classList.add('visible');

      /* Phase 3 — cursor drifts to button */
      nSched(500, function () {
        cursor.classList.add('visible');

        nSched(600, function () {
          var br = btn.getBoundingClientRect();
          var or2 = overlay.getBoundingClientRect();
          cursor.style.top = (br.top - or2.top + br.height * 0.5) + 'px';
          cursor.style.left = (br.left - or2.left + br.width * 0.6) + 'px';
          btn.classList.add('demo-nudge-btn--hover');
          /* start tapping loop after cursor arrives */
          setTimeout(function () { cursor.classList.add('tapping'); }, 700);
        });

      });

      btn.addEventListener('click', function () {
        if (nudgeResolved) return;
        routeCard(card, overlay);
      });
    });
  }

  function routeCard(card, overlay) {
    nudgeResolved = true;
    approvedCards['DIS-041'] = true;
    clearNudgeTimers();

    /* hide overlay */
    overlay.classList.remove('visible');
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 350);

    /* exit card from Research */
    card.classList.remove('demo-card--nudge');
    card.classList.add('demo-card--exit-right');
    showTicker('Mobile checkout drop-off \u2192 routed to Spec');

    setTimeout(function () {
      if (card.parentNode) card.parentNode.removeChild(card);

      /* enter a fresh card in Spec */
      var specData = { human: { initials: 'JS', color: '#3eb07a' }, title: 'Mobile checkout drop-off', id: 'DIS-041', pri: 'med' };
      var specBox = getColCards('spec');
      if (specBox) {
        var el = createCardEl(specData, false);
        el.classList.add('demo-card--enter-from-left');
        specBox.appendChild(el);
        setTimeout(function () { el.classList.remove('demo-card--enter-from-left'); }, 350);

        /* fade out after 2s */
        setTimeout(function () {
          el.classList.add('demo-card--exit-done');
          setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 380);
        }, 2000);
      }

      nudgeActive = false;
    }, 380);
  }

  /* ---- Init ---- */

  if (prefersReducedMotion) {
    populateInitial();
    showTicker('Shape Crafter wrote PRD, auto-created 12 build tasks from spec');
    return;
  }

  populateInitial();
  showTicker('Shape Crafter finalizing spec for Payment webhooks v2...');
  schedule(1000, runCycle);

  if ('IntersectionObserver' in window) {
    var running = true;
    var obs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting && running) {
          clearTimers();
          clearNudgeTimers();
          running = false;
        } else if (entries[i].isIntersecting && !running) {
          running = true;
          nudgeResolved = false;
          approvedCards = {};
          resetBoard();
          schedule(1200, runCycle);
        }
      }
    }, { threshold: 0.1 });
    obs.observe(demo);
  }
})();
