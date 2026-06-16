(function () {
  "use strict";
  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  var nav = document.getElementById("nav");
  function navScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 20); }
  var burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", function () { nav.classList.toggle("open"); });
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () { if (nav) nav.classList.remove("open"); });
  });

  var counted = false;
  function startCounts() {
    if (counted) return; counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.dataset.count) || 0;
      var pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      if (reduce) { el.textContent = pre + target + suf; return; }
      var dur = 1300, t0 = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  if (hasIO) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + "ms";
        el.classList.add("in"); io.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    var trig = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in", "play");
        if (e.target.classList.contains("stats")) startCounts();
        trig.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".chat-card, .stats").forEach(function (el) { trig.observe(el); });
  } else {
    html.classList.remove("js");
    document.querySelectorAll(".chat-card").forEach(function (el) { el.classList.add("in", "play"); });
    startCounts();
  }

  var px = document.querySelectorAll("[data-parallax]");
  function onScroll() {
    navScroll();
    if (reduce || !px.length) return;
    var y = window.scrollY;
    if (y < window.innerHeight * 1.4) {
      px.forEach(function (el) {
        var f = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = "translate3d(0," + (y * f).toFixed(1) + "px,0)";
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!reduce) {
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js";
    s.onload = function () {
      if (!window.Lenis) return;
      html.classList.add("lenis");
      var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      lenis.on("scroll", onScroll);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id.length > 1) {
            var t = document.querySelector(id);
            if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -72 }); }
          }
        });
      });
    };
    document.head.appendChild(s);
  }

  /* contact form: mailto fallback (no backend) */
  var f = document.getElementById("demoForm");
  if (f) f.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(f);
    var body = encodeURIComponent(
      "Имя: " + (d.get("name") || "") + "\nКомпания: " + (d.get("company") || "") +
      "\nEmail: " + (d.get("email") || "") + "\nТелефон: " + (d.get("phone") || "") +
      "\n\n" + (d.get("message") || ""));
    window.location.href = "mailto:hello@virtum.ru?subject=" +
      encodeURIComponent("Запрос демо — Virtum") + "&body=" + body;
    var ok = document.getElementById("formOk");
    if (ok) ok.hidden = false;
  });
})();
