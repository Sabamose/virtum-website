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
     CHAT WIDGET (hero) — animated Wiil-style conversation
     ============================================================ */
  function initChat() {
    var root = $("#chat-panel");
    if (!root) return;

    var LOGO = "/assets/logo.svg";
    var BIZ = "Novikov";
    var d = new Date(), pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var TIME = pad(d.getHours()) + ":" + pad(d.getMinutes());

    var SCRIPT = [
      { who: "agent", text: "Здравствуйте! Я Аура, ассистент Novikov. Чем могу помочь?" },
      { who: "user",  text: "столик на 4 в пятницу вечером" },
      { who: "agent", text: "Есть свободный стол в пятницу на 20:00. Забронировать на 4 гостей?" },
      { who: "user",  text: "да, давай" },
      { who: "agent", text: "Готово! Столик на 4, пятница 20:00. Подтверждение отправил в SMS. Ждём вас!" }
    ];

    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

    var callSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.6a1 1 0 011 1 11 11 0 00.56 3.5 1 1 0 01-.25 1z"/></svg>';
    var expandSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 21h5v-5M3 21l7-7M21 3l-7 7"/></svg>';
    var closeSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var sendSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.5-7.5a1 1 0 000-1.8L3.4 3.6a1 1 0 00-1.4 1l2 6.4 9 1-9 1-2 6.4a1 1 0 001.4 1z"/></svg>';

    root.innerHTML =
      '<div class="chat__head">' +
        '<div class="chat__avatar"><img src="' + LOGO + '" alt=""><i></i></div>' +
        '<div class="chat__id"><div class="chat__name">' + BIZ + '</div>' +
          '<div class="chat__role"><span class="chat__badge">AI</span><span>Ассистент</span></div></div>' +
        '<button class="chat__call" aria-label="Звонок">' + callSvg + 'Звонок</button>' +
        '<div class="chat__icons">' + expandSvg + closeSvg + '</div>' +
      '</div>' +
      '<div class="chat__body" id="chat-body"></div>' +
      '<div class="chat__input"><div class="chat__field"><span class="chat__field-text" id="chat-field">Введите сообщение…</span>' +
        '<span class="chat__send" id="chat-send">' + sendSvg + '</span></div></div>' +
      '<div class="chat__foot">Работает на <b>Виртум</b></div>';

    var body = $("#chat-body", root), field = $("#chat-field", root), send = $("#chat-send", root);
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function agentBubble(text) { return '<div class="bubble">' + esc(text) + '</div><div class="row__meta"><span class="row__meta-av"><img src="' + LOGO + '" alt=""></span>' + TIME + '</div>'; }
    function userBubble(text) { return '<div class="bubble">' + esc(text) + '</div><div class="row__meta">' + TIME + '</div>'; }

    if (prefersReduced) {
      var html = "";
      SCRIPT.forEach(function (s) { html += '<div class="row row--' + s.who + '">' + (s.who === "agent" ? agentBubble(s.text) : userBubble(s.text)) + '</div>'; });
      body.innerHTML = html; scrollDown();
      return;
    }

    function timeout(ms, fn) { setTimeout(fn, ms); }

    function addAgent(text, done) {
      var row = document.createElement("div");
      row.className = "row row--agent";
      row.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
      body.appendChild(row); scrollDown();
      timeout(1100, function () {
        row.innerHTML = agentBubble(text); scrollDown();
        if (done) timeout(750, done);
      });
    }
    function addUser(text, done) {
      field.classList.add("has-text");
      var i = 0;
      (function tick() {
        if (i <= text.length) { field.innerHTML = esc(text.slice(0, i++)) + '<span class="chat__caret">|</span>'; timeout(45, tick); }
        else {
          field.innerHTML = esc(text);
          send.classList.add("is-active");
          timeout(320, function () {
            field.textContent = "Введите сообщение…"; field.classList.remove("has-text"); send.classList.remove("is-active");
            var row = document.createElement("div");
            row.className = "row row--user";
            row.innerHTML = userBubble(text);
            body.appendChild(row); scrollDown();
            if (done) timeout(850, done);
          });
        }
      })();
    }

    function run() {
      body.innerHTML = "";
      field.textContent = "Введите сообщение…"; field.classList.remove("has-text"); send.classList.remove("is-active");
      var i = 0;
      (function next() {
        if (i >= SCRIPT.length) { timeout(3800, run); return; }
        var step = SCRIPT[i++];
        if (step.who === "agent") addAgent(step.text, next); else addUser(step.text, next);
      })();
    }
    timeout(500, run);
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
      .from(".hero .line__inner", { yPercent: 115, duration: 1.05, stagger: .1, ease: "power4.out" }, .15)
      .fromTo([".hero__sub", ".hero__claim", ".hero__actions", ".hero__meta"], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .09 }, .45)
      .fromTo(".hero__float", { opacity: 0, y: 30, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, .3)
      .fromTo(".hero__scroll", { opacity: 0 }, { opacity: 1, duration: .6 }, 1.1);
    // Safety net: the H1 must never stay hidden if the intro stalls or the tab
    // was backgrounded during load. Kill any in-flight tweens so they can't
    // re-assert a stalled value, then force the hero fully visible.
    setTimeout(function () {
      gsap.killTweensOf([".hero .line__inner", ".hero .reveal", ".hero__float"]);
      gsap.set(".hero .line__inner", { clearProps: "transform" }); // no CSS hidden state → visible
      gsap.set(".hero .reveal", { opacity: 1, y: 0 });
      gsap.set(".hero__float", { opacity: 1, y: 0, scale: 1 });
    }, 1600);
  }

  function revealAll(gsap, ScrollTrigger) {
    var els = $$(".reveal").filter(function (el) { return !el.closest("#hero"); });
    ScrollTrigger.batch(els, {
      start: "top 88%",
      onEnter: function (batch) { gsap.to(batch, { y: 0, opacity: 1, duration: .8, stagger: .09, ease: "power3.out", overwrite: true }); }
    });
  }

  function storyScene(gsap, ScrollTrigger) {
    var story = $("#story"), panels = $$("#story .story__panel");
    if (!story) return;
    var lock = $("#lock"), lockTime = $("#lock-time"), lkNotes = $$("#story .lk-note");
    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      panels.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
      lkNotes.forEach(function (el) { el.classList.remove("is-shown", "is-dim", "is-active", "is-resolved"); });
      if (lock) lock.classList.remove("is-resolving");
      if (!lkNotes.length) return;
      if (i === 0) {
        if (lockTime) lockTime.textContent = "21:00";
        lkNotes[0].classList.add("is-shown", "is-active");
      } else if (i === 1) {
        if (lockTime) lockTime.textContent = "02:00";
        lkNotes[0].classList.add("is-shown", "is-dim");
        lkNotes[1].classList.add("is-shown", "is-active");
      } else {
        if (lockTime) lockTime.textContent = "21:00";
        lkNotes[0].classList.add("is-shown", "is-resolved");
        lkNotes[1].classList.add("is-shown", "is-resolved");
        lkNotes[2].classList.add("is-shown", "is-active");
        if (lock) lock.classList.add("is-resolving");
      }
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
    $$(".call__wave").forEach(function (wave) {
      var n = 26, html = "";
      for (var i = 0; i < n; i++) html += '<i style="--i:' + i + '"></i>';
      wave.innerHTML = html;
    });
    var capEl = $("#call-caption");
    var lines = [
      "Здравствуйте! Чем могу помочь?",
      "Столик на 4 в пятницу, 20:00 — нашёл свободный.",
      "Готово. Бронь подтверждена, отправил SMS.",
      "Что-нибудь ещё? Хорошего вечера!"
    ];
    if (prefersReduced) { if (capEl) capEl.textContent = lines[2]; return; }
    // tick every call timer from its own data-start
    $$(".call__timer").forEach(function (el) {
      var sec = parseInt(el.getAttribute("data-start"), 10) || 0;
      setInterval(function () {
        if (document.hidden) return;
        sec++; var m = Math.floor(sec / 60), s = sec % 60;
        el.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      }, 1000);
    });
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
  function countUp(gsap, el) {
    if (!el || el._done) return;
    el._done = true;
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.4, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v).toLocaleString("ru-RU") + suffix; } });
  }

  function dashboardScene(gsap, ScrollTrigger) {
    $$(".kpi__spark path").forEach(function (p) { gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 }); });
    ScrollTrigger.batch(".kpi", {
      start: "top 85%",
      onEnter: function (batch) {
        batch.forEach(function (card) {
          var p = card.querySelector(".kpi__spark path");
          if (p) gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" });
          countUp(gsap, card.querySelector(".kpi__val"));
        });
      }
    });
    if ($(".cstat__num")) {
      ScrollTrigger.batch(".cstat__num", { start: "top 88%", onEnter: function (batch) { batch.forEach(function (el) { countUp(gsap, el); }); } });
    }
  }

  /* ── Boot ─────────────────────────────────────────────── */
  function init() { initChat(); initNav(); initCallUI(); initAudioPlayers(); initMotion(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
