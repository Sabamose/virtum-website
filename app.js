/* ============================================================
   VIRTUM — Homepage v3 · interactions
   - Scroll reveals, nav state, mobile menu
   - Live "today" counter
   - Trust ticker, feature & step rendering
   - Live agent animation (task-processing panel)
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ruNum = function (n) { return n.toLocaleString("ru-RU"); };
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ── Scroll reveal ───────────────────────────────────────
     Above-the-fold content reveals immediately on load; only
     below-the-fold elements wait for scroll. A timed safety net
     guarantees nothing ever stays invisible. */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-v]"));
    var revealAll = function () { els.forEach(function (el) { el.classList.add("on"); }); };

    if (prefersReduced || !("IntersectionObserver" in window)) { revealAll(); return; }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("on"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("on"); // in view now
      else obs.observe(el);
    });

    // Safety net: never leave content hidden if the observer misbehaves.
    setTimeout(revealAll, 2600);
  }

  /* ── Nav scroll state + mobile menu ──────────────────── */
  function initNav() {
    var nav = $("#top");
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("#nav-burger"), menu = $("#mobile-menu");
    var close = function () { burger.setAttribute("aria-expanded", "false"); menu.hidden = true; };
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) { close(); } else { burger.setAttribute("aria-expanded", "true"); menu.hidden = false; }
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ── Big "today" counter ─────────────────────────────── */
  function initLiveCounter() {
    var el = $("#live-counter");
    if (!el) return;
    var n = parseInt(el.getAttribute("data-target"), 10) || 12847;
    el.textContent = ruNum(n);
    if (prefersReduced) return;
    setInterval(function () {
      if (document.hidden) return;
      if (Math.random() > 0.45) { n++; el.textContent = ruNum(n); }
    }, 420);
  }

  /* ============================================================
     LIVE AGENT ANIMATION
     ============================================================ */
  function initAgent() {
    var root = $("#agent-panel");
    if (!root) return;

    var TASKS = [
      { icon: "🍽️", type: "РЕСТОРАН", accent: "#00C8D4", title: "Novikov Restaurant", detail: "4 персоны · пятница 20:00",
        input: "хочу стол на 4 в новикове в пятницу вечером",
        steps: ["Анализ намерения", "Поиск свободных слотов", "Резервация #T-4471", "Отправка подтверждения"],
        durations: [700, 1100, 950, 600],
        output: "Готово! Столик на 4 в Novikov\nПятница, 20:00 · Бронь NV-44721\nПодтверждение отправлено ✓" },
      { icon: "✈️", type: "АВИАБИЛЕТЫ", accent: "#4ECDE4", title: "SU-270 Москва → Дубай", detail: "2 пасс. · 18 июня 10:45",
        input: "купи 2 билета москва дубай на следующей неделе подешевле",
        steps: ["Поиск рейсов (14 вар.)", "Сравнение тарифов", "Бронирование SU-270", "Оформление билетов"],
        durations: [900, 800, 750, 520],
        output: "Куплено: SU-270 МСК→ДХБ\n18 июня 10:45 · Места 14C, 14D\n42 800 ₽ · Билеты на почте ✓" },
      { icon: "📦", type: "ЗАКАЗ ТОВАРА", accent: "#007B8A", title: "iPhone 15 Pro × 3 шт.", detail: "256GB · Чёрный титан",
        input: "нужно 3 айфона 15 про 256гб для сотрудников оплата юрлицо",
        steps: ["Проверка наличия", "Формирование B2B-заявки", "Согласование с поставщиком", "Подтверждение отгрузки"],
        durations: [650, 1000, 1200, 680],
        output: "Заявка принята! iPhone 15 Pro × 3\nСчёт №2847 на 269 700 ₽ отправлен\nДоставка: 17 июня (завтра) ✓" },
      { icon: "🏨", type: "БРОНЬ ОТЕЛЯ", accent: "#00C8D4", title: "Отель Метрополь", detail: "2 номера · 15–18 июня",
        input: "забронируй 2 стандартных номера в метрополе с 15 по 18 июня",
        steps: ["Проверка доступности", "Выбор категории номеров", "Резервация 2× Стандарт", "Ваучеры и подтверждение"],
        durations: [780, 720, 900, 580],
        output: "Забронировано: Метрополь\n2× Стандарт · 15–18 июня\nБронь MT-28441 · Ваучеры отправлены ✓" },
      { icon: "🏥", type: "МЕДИЦИНА", accent: "#4ECDE4", title: "Медси · Терапевт", detail: "Д-р Смирнова · завтра 14:00",
        input: "запишись к терапевту в медси на завтра после обеда желательно",
        steps: ["Поиск доступных слотов", "Выбор времени: 14:00", "Запись к д-р Смирновой", "СМС-напоминание пациенту"],
        durations: [700, 600, 820, 500],
        output: "Записано: Медси · Терапевт\nД-р Смирнова · завтра 14:00 · каб. 205\nНапоминание за 2 часа настроено ✓" }
    ];

    var state = {
      counter: 12847,
      taskIndex: 0,
      completed: [
        { type: "АВИАБИЛЕТЫ", title: "SU-270 МСК→ДХБ", time: "14:21:38", dur: "2.1с" },
        { type: "ЗАКАЗ",      title: "MacBook Pro × 2", time: "14:21:25", dur: "3.4с" },
        { type: "ОТЕЛЬ",      title: "Four Seasons · 5н", time: "14:21:09", dur: "2.8с" }
      ]
    };

    var timers = [];
    function after(ms, fn) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    var stepTimer = null;
    function clearAll() { timers.forEach(clearTimeout); timers = []; if (stepTimer) clearInterval(stepTimer); }

    // ── Build static shell once ──
    root.innerHTML =
      '<div class="agent__bar">' +
        '<div class="agent__dots"><i></i><i></i><i></i></div>' +
        '<div class="agent__title">ВИРТУМ · ИИ-АГЕНТ</div>' +
        '<div class="agent__live"><i></i><span id="ag-count"></span></div>' +
      '</div>' +
      '<div class="agent__body">' +
        '<div class="agent__main" id="ag-main"></div>' +
        '<div class="agent__feed" id="ag-feed"></div>' +
      '</div>';

    var elCount = $("#ag-count", root);
    var elMain = $("#ag-main", root);
    var elFeed = $("#ag-feed", root);
    var refs = {};

    function setCount() { elCount.textContent = ruNum(state.counter) + " задач"; }

    function task() { return TASKS[Math.max(0, state.taskIndex - 1) % TASKS.length]; }

    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

    // ── Feed (completed list) ──
    function renderFeed(freshFirst) {
      var rows = state.completed.slice(0, 5).map(function (c, i) {
        var fresh = i === 0 && freshFirst;
        return '' +
          '<div class="agent__done' + (fresh ? " is-fresh" : "") + '">' +
            '<div class="agent__done-top">' +
              '<span class="agent__done-check">✓</span>' +
              '<span class="agent__done-type">' + esc(c.type) + '</span>' +
            '</div>' +
            '<div class="agent__done-title">' + esc(c.title) + '</div>' +
            '<div class="agent__done-meta"><span class="agent__done-time">' + c.time + '</span><span class="agent__done-dur">' + c.dur + '</span></div>' +
          '</div>';
      }).join("");
      elFeed.innerHTML = '<div class="agent__feed-label">ВЫПОЛНЕНО</div>' + rows;
    }

    // ── Idle state ──
    function layoutIdle() {
      elMain.innerHTML =
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">' +
          '<div style="width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,200,212,.2);display:flex;align-items:center;justify-content:center">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:#00C8D4;animation:pulse 1.5s ease-in-out infinite"></div>' +
          '</div>' +
          '<div style="font-size:13px;color:rgba(237,244,250,.25)">Агент готов к работе…</div>' +
        '</div>';
    }

    // ── Build full task layout (badge + input + steps + output), blocks revealed progressively ──
    function layoutTask() {
      var t = task();
      var stepsHtml = "";
      for (var i = 0; i < 4; i++) {
        stepsHtml +=
          '<div class="agent__step" data-i="' + i + '">' +
            '<div class="agent__step-ic"><i></i></div>' +
            '<span class="agent__step-label">' + esc(t.steps[i]) + '</span>' +
            '<span class="agent__step-tail">—</span>' +
          '</div>';
      }
      elMain.innerHTML =
        '<div class="agent__task" style="border-left-color:' + t.accent + '">' +
          '<span class="agent__task-icon">' + t.icon + '</span>' +
          '<div class="agent__task-mid">' +
            '<div class="agent__task-type" style="color:' + t.accent + '">' + esc(t.type) + '</div>' +
            '<div class="agent__task-title">' + esc(t.title) + '</div>' +
            '<div class="agent__task-detail">' + esc(t.detail) + '</div>' +
          '</div>' +
          '<div class="agent__task-id">#' + ruNum(state.counter - 1) + '</div>' +
        '</div>' +
        '<div class="agent__input" hidden>' +
          '<div class="agent__block-label">▸ ВХОДЯЩИЙ ЗАПРОС</div>' +
          '<div class="agent__input-text"><span id="ag-in"></span><span class="agent__cursor" id="ag-in-cur">|</span></div>' +
        '</div>' +
        '<div class="agent__steps" hidden>' +
          '<div class="agent__block-label">▸ ОБРАБОТКА</div>' + stepsHtml +
        '</div>' +
        '<div class="agent__output" hidden>' +
          '<div class="agent__block-label">▸ ОТВЕТ АГЕНТА</div>' +
          '<div class="agent__output-text"><span id="ag-out"></span><span class="agent__output-cursor" id="ag-out-cur">▋</span></div>' +
        '</div>';

      refs.input   = $(".agent__input", elMain);
      refs.inText  = $("#ag-in", elMain);
      refs.inCur   = $("#ag-in-cur", elMain);
      refs.steps   = $(".agent__steps", elMain);
      refs.stepEls = Array.prototype.slice.call(elMain.querySelectorAll(".agent__step"));
      refs.output  = $(".agent__output", elMain);
      refs.outText = $("#ag-out", elMain);
      refs.outCur  = $("#ag-out-cur", elMain);
    }

    function setStep(i, status, pct) {
      var row = refs.stepEls[i];
      if (!row) return;
      row.className = "agent__step" + (status === "active" ? " is-active" : status === "done" ? " is-done" : "");
      var ic = $(".agent__step-ic", row);
      var tail = $(".agent__step-tail", row);
      if (status === "done") {
        ic.innerHTML = "✓";
        tail.textContent = "✓";
      } else if (status === "active") {
        ic.innerHTML = "<i></i>";
        tail.innerHTML = '<span class="agent__step-bar"><i style="width:' + (pct || 0) + '%"></i></span>';
      } else {
        ic.innerHTML = "<i></i>";
        tail.textContent = "—";
      }
    }

    // ── Flow ──
    function startTask() {
      clearInterval(stepTimer);
      var idx = state.taskIndex % TASKS.length;
      state.taskIndex = idx + 1;
      layoutTask();                 // badge visible, rest hidden
      after(480, typeInput);
    }

    function typeInput() {
      var full = task().input, i = 0;
      refs.input.hidden = false;
      refs.inCur.style.display = "";
      (function tick() {
        if (i <= full.length) {
          refs.inText.textContent = full.slice(0, i++);
          after(24 + Math.random() * 18, tick);
        } else {
          refs.inCur.style.display = "none";
          after(380, startSteps);
        }
      })();
    }

    function startSteps() {
      refs.steps.hidden = false;
      runStep(0);
    }

    function runStep(idx) {
      var dur = task().durations[idx];
      var frameMs = 33, total = Math.round(dur / frameMs), frame = 0;
      setStep(idx, "active", 0);
      // mark prior as done, later as pending
      for (var k = 0; k < 4; k++) { if (k < idx) setStep(k, "done"); else if (k > idx) setStep(k, "pending"); }

      if (idx === 2) after(dur * 0.35, typeOutput);

      clearInterval(stepTimer);
      var fill = refs.stepEls[idx].querySelector(".agent__step-bar i");
      stepTimer = setInterval(function () {
        frame++;
        var pct = Math.min(100, Math.round((frame / total) * 100));
        if (fill) fill.style.width = pct + "%";
        if (pct >= 100) {
          clearInterval(stepTimer);
          setStep(idx, "done");
          if (idx < 3) { after(160, function () { runStep(idx + 1); }); }
          else { after(650, completeTask); }
        }
      }, frameMs);
    }

    function typeOutput() {
      refs.output.hidden = false;
      refs.outCur.style.display = "";
      var full = task().output, i = 0;
      (function tick() {
        if (i <= full.length) {
          refs.outText.textContent = full.slice(0, i++);
          after(14 + Math.random() * 10, tick);
        }
      })();
    }

    function completeTask() {
      refs.outCur.style.display = "none";
      var t = task();
      var now = new Date();
      var ts = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      var dur = (2.0 + Math.random() * 3.2).toFixed(1) + "с";
      state.completed = [{ type: t.type, title: t.title, time: ts, dur: dur }].concat(state.completed.slice(0, 5));
      renderFeed(true);
      after(1300, startTask);
    }

    // ── Boot ──
    setCount();
    renderFeed(false);

    if (prefersReduced) {
      // Static, representative frame: show a completed task, no loops
      state.taskIndex = 1;
      layoutTask();
      refs.input.hidden = false; refs.inCur.style.display = "none";
      refs.inText.textContent = TASKS[0].input;
      refs.steps.hidden = false;
      for (var s = 0; s < 4; s++) setStep(s, "done");
      refs.output.hidden = false; refs.outCur.style.display = "none";
      refs.outText.textContent = TASKS[0].output;
      return;
    }

    setInterval(function () {
      if (document.hidden) return;
      if (Math.random() > 0.55) { state.counter++; setCount(); }
    }, 320);

    layoutIdle();
    after(600, startTask);
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    initReveal();
    initNav();
    initLiveCounter();
    initAgent();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
