/* ============================================================
   VIRTUM — homepage interactions
   - Live agent animation panel (hero)
   - Nav state + mobile menu
   - Motion system: Lenis smooth scroll + GSAP ScrollTrigger
     (hero intro, scroll reveals, pinned story, fan-out, catalog swap,
      progress bar, magnetic buttons). Bulletproof reduced-motion / no-lib
      fallback that leaves all content visible.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var ruNum = function (n) { return n.toLocaleString("ru-RU"); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ============================================================
     LIVE AGENT ANIMATION (hero panel)
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

    var elCount = $("#ag-count", root), elMain = $("#ag-main", root), elFeed = $("#ag-feed", root);
    var refs = {};
    function setCount() { elCount.textContent = ruNum(state.counter) + " задач"; }
    function task() { return TASKS[Math.max(0, state.taskIndex - 1) % TASKS.length]; }
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

    function renderFeed(freshFirst) {
      var rows = state.completed.slice(0, 5).map(function (c, i) {
        var fresh = i === 0 && freshFirst;
        return '<div class="agent__done' + (fresh ? " is-fresh" : "") + '">' +
          '<div class="agent__done-top"><span class="agent__done-check">✓</span><span class="agent__done-type">' + esc(c.type) + '</span></div>' +
          '<div class="agent__done-title">' + esc(c.title) + '</div>' +
          '<div class="agent__done-meta"><span class="agent__done-time">' + c.time + '</span><span class="agent__done-dur">' + c.dur + '</span></div>' +
        '</div>';
      }).join("");
      elFeed.innerHTML = '<div class="agent__feed-label">ВЫПОЛНЕНО</div>' + rows;
    }

    function layoutIdle() {
      elMain.innerHTML =
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">' +
          '<div style="width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,200,212,.2);display:flex;align-items:center;justify-content:center">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:#00C8D4;animation:pulse 1.5s ease-in-out infinite"></div></div>' +
          '<div style="font-size:13px;color:rgba(237,244,250,.25)">Агент готов к работе…</div>' +
        '</div>';
    }

    function layoutTask() {
      var t = task(), stepsHtml = "";
      for (var i = 0; i < 4; i++) {
        stepsHtml += '<div class="agent__step" data-i="' + i + '"><div class="agent__step-ic"><i></i></div>' +
          '<span class="agent__step-label">' + esc(t.steps[i]) + '</span><span class="agent__step-tail">—</span></div>';
      }
      elMain.innerHTML =
        '<div class="agent__task" style="border-left-color:' + t.accent + '"><span class="agent__task-icon">' + t.icon + '</span>' +
          '<div class="agent__task-mid"><div class="agent__task-type" style="color:' + t.accent + '">' + esc(t.type) + '</div>' +
            '<div class="agent__task-title">' + esc(t.title) + '</div><div class="agent__task-detail">' + esc(t.detail) + '</div></div>' +
          '<div class="agent__task-id">#' + ruNum(state.counter - 1) + '</div></div>' +
        '<div class="agent__input" hidden><div class="agent__block-label">▸ ВХОДЯЩИЙ ЗАПРОС</div>' +
          '<div class="agent__input-text"><span id="ag-in"></span><span class="agent__cursor" id="ag-in-cur">|</span></div></div>' +
        '<div class="agent__steps" hidden><div class="agent__block-label">▸ ОБРАБОТКА</div>' + stepsHtml + '</div>' +
        '<div class="agent__output" hidden><div class="agent__block-label">▸ ОТВЕТ АГЕНТА</div>' +
          '<div class="agent__output-text"><span id="ag-out"></span><span class="agent__output-cursor" id="ag-out-cur">▋</span></div></div>';
      refs.input = $(".agent__input", elMain); refs.inText = $("#ag-in", elMain); refs.inCur = $("#ag-in-cur", elMain);
      refs.steps = $(".agent__steps", elMain); refs.stepEls = $$(".agent__step", elMain);
      refs.output = $(".agent__output", elMain); refs.outText = $("#ag-out", elMain); refs.outCur = $("#ag-out-cur", elMain);
    }

    function setStep(i, status, pct) {
      var row = refs.stepEls[i]; if (!row) return;
      row.className = "agent__step" + (status === "active" ? " is-active" : status === "done" ? " is-done" : "");
      var ic = $(".agent__step-ic", row), tail = $(".agent__step-tail", row);
      if (status === "done") { ic.innerHTML = "✓"; tail.textContent = "✓"; }
      else if (status === "active") { ic.innerHTML = "<i></i>"; tail.innerHTML = '<span class="agent__step-bar"><i style="width:' + (pct || 0) + '%"></i></span>'; }
      else { ic.innerHTML = "<i></i>"; tail.textContent = "—"; }
    }

    function startTask() {
      clearInterval(stepTimer);
      var idx = state.taskIndex % TASKS.length; state.taskIndex = idx + 1;
      layoutTask(); after(480, typeInput);
    }
    function typeInput() {
      var full = task().input, i = 0; refs.input.hidden = false; refs.inCur.style.display = "";
      (function tick() {
        if (i <= full.length) { refs.inText.textContent = full.slice(0, i++); after(24 + Math.random() * 18, tick); }
        else { refs.inCur.style.display = "none"; after(380, startSteps); }
      })();
    }
    function startSteps() { refs.steps.hidden = false; runStep(0); }
    function runStep(idx) {
      var dur = task().durations[idx], frameMs = 33, total = Math.round(dur / frameMs), frame = 0;
      setStep(idx, "active", 0);
      for (var k = 0; k < 4; k++) { if (k < idx) setStep(k, "done"); else if (k > idx) setStep(k, "pending"); }
      if (idx === 2) after(dur * 0.35, typeOutput);
      clearInterval(stepTimer);
      var fill = refs.stepEls[idx].querySelector(".agent__step-bar i");
      stepTimer = setInterval(function () {
        frame++; var pct = Math.min(100, Math.round((frame / total) * 100));
        if (fill) fill.style.width = pct + "%";
        if (pct >= 100) { clearInterval(stepTimer); setStep(idx, "done");
          if (idx < 3) after(160, function () { runStep(idx + 1); }); else after(650, completeTask); }
      }, frameMs);
    }
    function typeOutput() {
      refs.output.hidden = false; refs.outCur.style.display = "";
      var full = task().output, i = 0;
      (function tick() { if (i <= full.length) { refs.outText.textContent = full.slice(0, i++); after(14 + Math.random() * 10, tick); } })();
    }
    function completeTask() {
      refs.outCur.style.display = "none";
      var t = task(), now = new Date();
      var ts = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      var dur = (2.0 + Math.random() * 3.2).toFixed(1) + "с";
      state.completed = [{ type: t.type, title: t.title, time: ts, dur: dur }].concat(state.completed.slice(0, 5));
      renderFeed(true); after(1300, startTask);
    }

    setCount(); renderFeed(false);

    if (prefersReduced) {
      state.taskIndex = 1; layoutTask();
      refs.input.hidden = false; refs.inCur.style.display = "none"; refs.inText.textContent = TASKS[0].input;
      refs.steps.hidden = false; for (var s = 0; s < 4; s++) setStep(s, "done");
      refs.output.hidden = false; refs.outCur.style.display = "none"; refs.outText.textContent = TASKS[0].output;
      return;
    }
    setInterval(function () { if (document.hidden) return; if (Math.random() > 0.55) { state.counter++; setCount(); } }, 320);
    layoutIdle(); after(600, startTask);
  }

  /* ============================================================
     NAV + MOBILE MENU
     ============================================================ */
  function initNav() {
    var nav = $("#top");
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("#nav-burger"), menu = $("#mobile-menu");
    var close = function () { burger.setAttribute("aria-expanded", "false"); menu.hidden = true; };
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) close(); else { burger.setAttribute("aria-expanded", "true"); menu.hidden = false; }
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ============================================================
     CATALOG PREVIEW (shared by motion + fallback)
     ============================================================ */
  var CATALOGS = [
    { ch: "ВИРТУМ · ЧАТ",     icon: "🍽️", name: "Паста Карбонара",   sub: "890 ₽ · большая порция",   bubble: "добавь карбонару и два латте",            out: "Заказ оформлен" },
    { ch: "ВИРТУМ · САЙТ",    icon: "📦", name: "iPhone 15 Pro",       sub: "256 ГБ · в наличии",        bubble: "нужен айфон 15 про для юрлица, со счётом", out: "Счёт выставлен" },
    { ch: "ВИРТУМ · ТЕЛЕФОН", icon: "✂️", name: "Стрижка + укладка",   sub: "60 мин · мастер Анна",      bubble: "запишите на стрижку в субботу днём",      out: "Запись подтверждена" },
    { ch: "ВИРТУМ · ЧАТ",     icon: "🏠", name: "2-комн · 75 м²",       sub: "Центр · 18 млн ₽",          bubble: "можно посмотреть квартиру в среду?",      out: "Показ назначен" },
    { ch: "ВИРТУМ · ПОЧТА",   icon: "🏨", name: "Номер Делюкс",        sub: "15–18 июня · 2 гостя",      bubble: "забронируйте делюкс на три ночи",         out: "Бронь подтверждена" },
    { ch: "ВИРТУМ · SMS",     icon: "🚲", name: "Велосипед горный",    sub: "3 дня · залог 5 000 ₽",     bubble: "арендую велосипед на выходные",           out: "Аренда оформлена" }
  ];
  var catActive = -1;
  function renderCatalog(i, animate) {
    if (i === catActive) return; catActive = i;
    var c = CATALOGS[i], body = $("#cat-body"), label = $("#cat-channel");
    if (!body) return;
    if (label) label.textContent = c.ch;
    body.innerHTML =
      '<div class="cat-row"><span class="cat-row__icon">' + c.icon + '</span>' +
        '<div class="cat-row__mid"><div class="cat-row__name">' + c.name + '</div><div class="cat-row__sub">' + c.sub + '</div></div></div>' +
      '<div class="cat-bubble">«' + c.bubble + '»</div>' +
      '<div class="cat-outcome">' + c.out + '</div>';
    $$(".cat-item").forEach(function (it, k) { it.classList.toggle("is-active", k === i); });
    if (animate) { body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap"); }
  }

  /* ============================================================
     MOTION SYSTEM (Lenis + GSAP)
     ============================================================ */
  function initMotion() {
    var hasGsap = window.gsap && window.ScrollTrigger;
    renderCatalog(0, false);             // always render first catalog

    if (prefersReduced || !hasGsap) {    // ── Fallback: everything visible, native anchors
      $$(".cat-item").forEach(function (it) { it.style.opacity = "1"; });
      initAnchors(null);
      return;
    }

    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("has-anim");

    // Lenis smooth scroll
    var lenis = null;
    try {
      if (window.Lenis) {
        lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      }
    } catch (e) { lenis = null; }

    initAnchors(lenis);
    try {
      heroIntro(gsap);
      revealAll(gsap, ScrollTrigger);
      storyScene(gsap, ScrollTrigger);
      fanScene(gsap, ScrollTrigger);
      catalogScene(gsap, ScrollTrigger, lenis);
      dashboardScene(gsap, ScrollTrigger);
      progressBar(ScrollTrigger);
      if (canHover) magnetic(gsap);
      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
      ScrollTrigger.refresh();
    } catch (err) {
      // Self-heal: never leave content hidden if a scene errors.
      document.documentElement.classList.remove("has-anim");
      var story = $("#story"); if (story) story.classList.remove("is-pinned");
      $$(".reveal, .line__inner, .fan__node").forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; });
    }
  }

  function initAnchors(lenis) {
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      a.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var burger = $("#nav-burger"), menu = $("#mobile-menu");
        if (menu && !menu.hidden) { burger.setAttribute("aria-expanded", "false"); menu.hidden = true; }
        if (lenis) lenis.scrollTo(target, { offset: -56 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function heroIntro(gsap) {
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero .badge", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .1)
      .fromTo(".hero .line__inner", { yPercent: 115 }, { yPercent: 0, duration: 1.05, stagger: .1, ease: "power4.out" }, .15)
      .fromTo([".hero__sub", ".hero__claim", ".hero__actions", ".hero__meta"], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .09 }, .45)
      .fromTo(".hero__float", { opacity: 0, y: 30, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, .3)
      .fromTo(".hero__scroll", { opacity: 0 }, { opacity: 1, duration: .6 }, 1.1);
  }

  function revealAll(gsap, ScrollTrigger) {
    var els = $$(".reveal").filter(function (el) { return !el.closest("#hero"); });
    ScrollTrigger.batch(els, {
      start: "top 88%",
      onEnter: function (batch) { gsap.to(batch, { y: 0, opacity: 1, duration: .8, stagger: .09, ease: "power3.out", overwrite: true }); }
    });
  }

  function storyScene(gsap, ScrollTrigger) {
    var story = $("#story"), panels = $$("#story .story__panel"), notes = $$("#story .note");
    if (!story) return;
    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      panels.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
      notes.forEach(function (n, k) { n.classList.toggle("is-on", k === i); });
    }
    var mm = gsap.matchMedia();
    mm.add("(min-width: 921px)", function () {
      story.classList.add("is-pinned");
      setStep(0);
      var st = ScrollTrigger.create({
        trigger: story, start: "top top", end: "+=240%", pin: ".story__pin", anticipatePin: 1,
        onUpdate: function (self) { setStep(Math.min(2, Math.floor(self.progress * 2.999))); }
      });
      return function () { story.classList.remove("is-pinned"); cur = -1; st.kill(); };
    });
  }

  function fanScene(gsap, ScrollTrigger) {
    var paths = $$("#fan .fan__paths path"), nodes = $$("#fan .fan__node");
    if (!paths.length) return;
    paths.forEach(function (p) { var len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#publish", start: "top 72%", end: "center 60%", scrub: .6 } });
    tl.to(paths, { strokeDashoffset: 0, stagger: .12, ease: "none" }, 0)
      .to(nodes, { opacity: 1, y: 0, scale: 1, stagger: .12, ease: "power2.out" }, .15);
  }

  function catalogScene(gsap, ScrollTrigger, lenis) {
    var items = $$("#catalogs .cat-item");
    items.forEach(function (item, i) {
      ScrollTrigger.create({
        trigger: item, start: "top 62%", end: "bottom 62%",
        onEnter: function () { renderCatalog(i, true); },
        onEnterBack: function () { renderCatalog(i, true); }
      });
      item.addEventListener("click", function () {
        renderCatalog(i, true);
        if (lenis) lenis.scrollTo(item, { offset: -120 });
        else item.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function progressBar(ScrollTrigger) {
    var bar = $("#scroll-progress");
    if (!bar) return;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) { bar.style.width = (self.progress * 100).toFixed(2) + "%"; } });
  }

  function magnetic(gsap) {
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: "power3.out" });
      });
      btn.addEventListener("mouseleave", function () { gsap.to(btn, { x: 0, y: 0, duration: .5, ease: "elastic.out(1,.4)" }); });
    });
  }

  /* ============================================================
     iPHONE CALL UI
     ============================================================ */
  function initCallUI() {
    var wave = $("#call-wave");
    if (wave) {
      var n = 26, html = "";
      for (var i = 0; i < n; i++) html += '<i style="--i:' + i + '"></i>';
      wave.innerHTML = html;
    }
    var timerEl = $("#call-timer"), capEl = $("#call-caption");
    var lines = [
      "Здравствуйте! Чем могу помочь?",
      "Столик на 4 в пятницу, 20:00 — нашёл свободный.",
      "Готово. Бронь подтверждена, отправил SMS.",
      "Что-нибудь ещё? Хорошего вечера!"
    ];
    if (prefersReduced) { if (capEl) capEl.textContent = lines[2]; return; }
    if (timerEl) {
      var sec = 14;
      setInterval(function () {
        if (document.hidden) return;
        sec++; var m = Math.floor(sec / 60), s = sec % 60;
        timerEl.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      }, 1000);
    }
    if (capEl) {
      var li = 0;
      (function typeLine() {
        var full = lines[li % lines.length]; li++; var i = 0;
        (function tick() {
          if (i <= full.length) { capEl.textContent = full.slice(0, i++); setTimeout(tick, 26); }
          else { setTimeout(typeLine, 2600); }
        })();
      })();
    }
  }

  /* ============================================================
     AUDIO PLAYERS (real audio if present, else demo animation)
     ============================================================ */
  function initAudioPlayers() {
    // Flip to true once real recordings exist at the data-audio paths
    // (/assets/audio/*.mp3). Until then players run a silent demo animation.
    var AUDIO_READY = false;
    var BARS = 34;
    $$(".audio").forEach(function (card) {
      var wave = $(".audio__wave", card);
      if (wave) {
        var html = "";
        for (var i = 0; i < BARS; i++) {
          var h = 22 + Math.round(Math.abs(Math.sin(i * 0.7)) * 64 + (i % 3) * 8);
          if (h > 100) h = 100;
          html += '<i style="--i:' + i + ';--h:' + h + '%"></i>';
        }
        wave.innerHTML = html;
      }
      var btn = $(".audio__play", card);
      var src = card.getAttribute("data-audio");
      var dur = parseInt(card.getAttribute("data-dur"), 10) || 20;

      function stop() {
        card.classList.remove("is-playing");
        if (card._audio) card._audio.pause();
        if (card._demo) { clearTimeout(card._demo); card._demo = null; }
      }
      function runDemo() { if (card._demo) return; card._demo = setTimeout(stop, dur * 1000); }
      if (!btn) return;
      btn.addEventListener("click", function () {
        if (card.classList.contains("is-playing")) { stop(); return; }
        $$(".audio").forEach(function (o) { if (o !== card) { o.classList.remove("is-playing"); if (o._audio) o._audio.pause(); if (o._demo) { clearTimeout(o._demo); o._demo = null; } } });
        card.classList.add("is-playing");
        if (src && AUDIO_READY) {
          if (!card._audio) {
            card._audio = new Audio(src);
            card._audio.addEventListener("ended", stop);
            card._audio.addEventListener("error", runDemo);
          }
          var p = card._audio.play();
          if (p && p.catch) p.catch(runDemo);
        } else { runDemo(); }
      });
    });
  }

  /* ── Dashboard: count-ups + sparkline draw (motion path) ─ */
  function dashboardScene(gsap, ScrollTrigger) {
    $$(".kpi__spark path").forEach(function (p) { gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 }); });
    ScrollTrigger.batch(".kpi", {
      start: "top 85%",
      onEnter: function (batch) {
        batch.forEach(function (card) {
          var p = card.querySelector(".kpi__spark path");
          if (p) gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" });
          var el = card.querySelector(".kpi__val");
          if (el && !el._done) {
            el._done = true;
            var target = parseInt(el.getAttribute("data-count"), 10) || 0;
            var suffix = el.getAttribute("data-suffix") || "";
            var obj = { v: 0 };
            gsap.to(obj, { v: target, duration: 1.4, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString("ru-RU") + suffix; } });
          }
        });
      }
    });
  }

  /* ── Boot ─────────────────────────────────────────────── */
  function init() { initAgent(); initNav(); initCallUI(); initAudioPlayers(); initMotion(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
