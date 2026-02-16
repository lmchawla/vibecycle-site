/* =========================================
   Orchestration demo — self-playing four-scenario animation
   Config cards serve as selectors: click a card to see its level in action
   L0 Manual → L1 Approval Gate → L2 Supervised → L3 Autopilot
   ========================================= */
(function () {
  'use strict';

  var demo = document.getElementById('orchDemo');
  if (!demo) return;

  var cards = demo.querySelectorAll('.autonomy-example[data-level]');
  var scenarios = demo.querySelectorAll('.orch-scenario');
  var cursor = document.getElementById('orchCursor');
  var approveBtn = document.getElementById('orchBtnApprove');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];
  var running = false;

  var sequence = ['l0', 'l1', 'l2', 'l3'];

  if (prefersReducedMotion) {
    var first = demo.querySelector('.orch-scenario[data-scenario="l0"]');
    if (first) {
      first.querySelectorAll('.orch-step').forEach(function (step) {
        step.classList.add('orch-step--visible');
      });
    }
    return;
  }

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function schedule(fn, ms) {
    var t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }

  function highlightCard(scenarioId) {
    cards.forEach(function (card) {
      if (card.getAttribute('data-level') === scenarioId) {
        card.classList.add('autonomy-example--active');
      } else {
        card.classList.remove('autonomy-example--active');
      }
    });
  }

  function activateScenario(scenarioId) {
    scenarios.forEach(function (s) {
      var isTarget = s.getAttribute('data-scenario') === scenarioId;
      if (isTarget) {
        s.classList.add('orch-scenario--active');
      } else {
        s.classList.remove('orch-scenario--active');
      }
      s.querySelectorAll('.orch-step').forEach(function (step) {
        step.classList.remove('orch-step--visible');
      });
    });
    highlightCard(scenarioId);
  }

  function resetCursor() {
    if (cursor) {
      cursor.classList.remove('orch-sim-cursor--visible');
      cursor.classList.remove('orch-sim-cursor--at-button');
    }
    if (approveBtn) {
      approveBtn.classList.remove('orch-btn-approve--clicked');
    }
  }

  function revealStep(scenario, stepNum) {
    var el = scenario.querySelector('.orch-step[data-step="' + stepNum + '"]');
    if (el) el.classList.add('orch-step--visible');
  }

  function nextInSequence(current) {
    var idx = sequence.indexOf(current);
    return sequence[(idx + 1) % sequence.length];
  }

  function runScenario(id) {
    var scenario = demo.querySelector('.orch-scenario[data-scenario="' + id + '"]');
    if (!scenario) return;

    activateScenario(id);
    resetCursor();

    schedule(function () { revealStep(scenario, 1); }, 300);
    schedule(function () { revealStep(scenario, 2); }, 1800);

    if (id === 'l1') {
      schedule(function () {
        if (cursor) cursor.classList.add('orch-sim-cursor--visible');
      }, 2800);
      schedule(function () {
        if (cursor) cursor.classList.add('orch-sim-cursor--at-button');
      }, 3200);
      schedule(function () {
        if (approveBtn) approveBtn.classList.add('orch-btn-approve--clicked');
      }, 3800);
      schedule(function () { revealStep(scenario, '2b'); }, 4200);
      schedule(function () { revealStep(scenario, 3); }, 4800);
      schedule(function () { runScenario(nextInSequence(id)); }, 7100);
    } else if (id === 'l2') {
      schedule(function () { revealStep(scenario, '2b'); }, 2600);
      schedule(function () { revealStep(scenario, 3); }, 3600);
      schedule(function () { runScenario(nextInSequence(id)); }, 5800);
    } else {
      schedule(function () { revealStep(scenario, 3); }, 3200);
      schedule(function () { runScenario(nextInSequence(id)); }, 5500);
    }
  }

  function start() {
    if (running) return;
    running = true;
    runScenario('l0');
  }

  function stop() {
    running = false;
    clearTimers();
    resetCursor();
  }

  cards.forEach(function (card) {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    function activate() {
      var id = card.getAttribute('data-level');
      stop();
      running = true;
      runScenario(id);
    }
    card.addEventListener('click', activate);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(demo);
})();
