// entrate allo scorrimento, isola che si nasconde scendendo, scheda attiva del menù, menù del telefono,
// pulsante IT/EN, brace del tandoor che sale nell'eroe
(() => {
  const html = document.documentElement;
  const memoria = {
    get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} },
  };

  // entrate: anche dopo un salto a una sezione il testo deve esserci subito (GIANNI §2.3)
  let attese = [...document.querySelectorAll(".rivela")];
  const mostra = (el) => el.classList.add("dentro");
  const io = new IntersectionObserver((voci) => voci.forEach((v) => {
    if (v.isIntersecting) { mostra(v.target); io.unobserve(v.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  attese.forEach((el) => io.observe(el));
  const recupera = () => {
    // quel che è già passato sopra o sta nello schermo si mostra senza aspettare
    attese = attese.filter((el) => {
      if (el.getBoundingClientRect().top < innerHeight) { mostra(el); io.unobserve(el); return false; }
      return true;
    });
  };
  addEventListener("hashchange", recupera);
  addEventListener("load", recupera);

  const isola = document.querySelector(".isola");
  let ultimo = 0, attesa = false;
  addEventListener("scroll", () => {
    if (attesa) return;
    attesa = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const giu = y > ultimo && y > 500 && !document.body.classList.contains("aperto");
      isola.classList.toggle("nascosta", giu);
      document.body.classList.toggle("giu", giu);
      document.body.classList.toggle("lontano", y > innerHeight * 1.5);
      if (Math.abs(y - ultimo) > innerHeight * 0.4) recupera();   // salto lungo: niente riquadri vuoti
      ultimo = y; attesa = false;
    });
  }, { passive: true });

  const schede = document.querySelectorAll(".schede a");
  if (schede.length) {
    const sezioni = new IntersectionObserver((voci) => voci.forEach((v) => {
      if (!v.isIntersecting) return;
      schede.forEach((a) => {
        const on = a.dataset.sz === v.target.id.slice(2);
        a.classList.toggle("attiva", on);
        if (on) a.parentElement.scrollTo({ left: a.offsetLeft - a.parentElement.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
      });
    }), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".sz").forEach((s) => sezioni.observe(s));
  }

  const hamb = document.querySelector(".hamb");
  const chiudi = () => { document.body.classList.remove("aperto"); hamb.setAttribute("aria-expanded", "false"); };
  hamb.addEventListener("click", () => {
    const aperto = document.body.classList.toggle("aperto");
    hamb.setAttribute("aria-expanded", String(aperto));
  });
  document.querySelectorAll(".velo a").forEach((a) => a.addEventListener("click", chiudi));

  // IT / EN: ogni testo tradotto porta l'inglese in data-en
  const tradotti = [...document.querySelectorAll("[data-en]")];
  tradotti.forEach((el) => { el.dataset.it = el.innerHTML; });
  const lingua = (l) => {
    html.lang = l;
    html.classList.toggle("en", l === "en");
    tradotti.forEach((el) => { el.innerHTML = l === "en" ? el.dataset.en : el.dataset.it; });
    memoria.set("taj-lingua", l);
  };
  document.querySelector(".lingua").addEventListener("click", () => lingua(html.lang === "en" ? "it" : "en"));
  if (memoria.get("taj-lingua") === "en") lingua("en");

  // brace del tandoor: scintille zafferano che salgono dal Taj inciso, lente, solo quando l'eroe si vede
  const tela = document.querySelector(".brace");
  if (tela && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cx = tela.getContext("2d");
    let w = 0, h = 0, dpr = 1, vivo = true, scintille = [];
    const misura = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = tela.clientWidth; h = tela.clientHeight;
      tela.width = w * dpr; tela.height = h * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const nuova = (inizio) => ({
      x: w * (0.18 + Math.random() * 0.64),
      y: inizio ? h * (0.3 + Math.random() * 0.7) : h + 10,
      r: 0.9 + Math.random() * 2.4,
      v: 0.25 + Math.random() * 0.6,
      onda: Math.random() * Math.PI * 2,
      vita: 0.55 + Math.random() * 0.45,
    });
    const avvia = () => { misura(); scintille = Array.from({ length: w < 600 ? 40 : 80 }, () => nuova(true)); };
    const passo = () => {
      if (!vivo) return;
      cx.clearRect(0, 0, w, h);
      for (const s of scintille) {
        s.y -= s.v; s.onda += 0.012; s.x += Math.sin(s.onda) * 0.35;
        const alto = 1 - s.y / h;                       // si spengono salendo
        const a = Math.max(0, s.vita * (1 - alto * 1.15));
        if (s.y < -10 || a <= 0.01) Object.assign(s, nuova(false));
        const g = cx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        g.addColorStop(0, `rgba(255,196,120,${a})`);
        g.addColorStop(0.25, `rgba(236,138,76,${a * 0.55})`);
        g.addColorStop(1, "rgba(214,104,46,0)");
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2); cx.fill();
      }
      requestAnimationFrame(passo);
    };
    avvia();
    addEventListener("resize", avvia);
    new IntersectionObserver(([v]) => {
      const era = vivo; vivo = v.isIntersecting;
      if (vivo && !era) requestAnimationFrame(passo);
    }).observe(tela);
    requestAnimationFrame(passo);
  }
})();
