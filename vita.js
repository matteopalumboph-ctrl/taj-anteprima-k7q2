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
        if (on) { const p = a.parentElement, ra = a.getBoundingClientRect(), rp = p.getBoundingClientRect(); p.scrollBy({ left: ra.left + ra.width / 2 - (rp.left + rp.width / 2), behavior: "smooth" }); }   // vale anche da destra a sinistra (urdu)
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

  // IT / EN / اردو: ogni testo tradotto porta l'inglese in data-en e l'urdu in data-ur (8/11)
  const tradotti = [...document.querySelectorAll("[data-en]")];
  tradotti.forEach((el) => { el.dataset.it = el.innerHTML; });
  const lingua = (l) => {
    html.lang = l;
    html.classList.toggle("en", l === "en");
    html.classList.toggle("ur", l === "ur");
    tradotti.forEach((el) => {
      const ur = l === "ur" && el.dataset.ur;
      el.innerHTML = l === "en" ? el.dataset.en : l === "ur" ? (el.dataset.ur || el.dataset.it) : el.dataset.it;
      if (ur) el.setAttribute("dir", "rtl"); else el.removeAttribute("dir");
      el.classList.toggle("in-ur", !!ur);
    });
    // urdu: i blocchi che restano tutti in urdu vanno a destra (le righe dei piatti con nomi latini no)
    document.querySelectorAll(".ur-dx").forEach((p) => p.classList.remove("ur-dx"));
    if (l === "ur") document.querySelectorAll(".in-ur").forEach((el) => {
      const p = el.parentElement; if (!p || p.closest(".lingua, nav")) return;
      const lat = (p.textContent.match(/[A-Za-zÀ-ÿ]/g) || []).length;
      const urd = (p.textContent.match(/[\u0600-\u06FF]/g) || []).length;
      if (urd > 0 && lat <= urd * 0.25) p.classList.add("ur-dx");
    });
    document.querySelectorAll(".lingua button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === l)));
    memoria.set("taj-lingua", l);
  };
  document.querySelectorAll(".lingua button").forEach((b) => b.addEventListener("click", () => lingua(b.dataset.l)));
  const salvata = memoria.get("taj-lingua");
  if (salvata === "en" || salvata === "ur") lingua(salvata);

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

// recensione YouTube: il riquadro di YouTube si carica solo al clic (niente cookie prima)
document.querySelectorAll(".yt").forEach((b) => b.addEventListener("click", () => {
  const f = document.createElement("iframe");
  f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0`;
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  f.allowFullscreen = true; f.title = "Recensione Taj Mahal Brescia";
  b.replaceWith(f);
}));

// foto dei piatti: tocco sulla miniatura → foto grande; tocco o Esc per chiudere
(() => {
  const vf = document.querySelectorAll(".vf");
  if (!vf.length) return;
  const box = document.createElement("div");
  box.className = "foto-grande"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>';
  document.body.append(box);
  const img = box.querySelector("img"), cap = box.querySelector("figcaption");
  const chiudi = () => box.classList.remove("su");
  vf.forEach((b) => b.addEventListener("click", () => {
    img.src = `img/piatti_tutti/${b.dataset.n}.webp`; img.alt = b.dataset.nome; cap.textContent = b.dataset.nome;
    box.classList.add("su");
  }));
  box.addEventListener("click", chiudi);
  addEventListener("keydown", (ev) => { if (ev.key === "Escape") chiudi(); });
})();

// carrello: si sceglie dal menù, l'ordine parte già scritto su WhatsApp, solo ritiro al ristorante (a domicilio solo Glovo)
(() => {
  const car = document.querySelector(".car");
  if (!car) return;
  const html = document.documentElement;
  const en = () => html.lang === "en";
  const ur = () => html.lang === "ur";
  const euro = (x) => x.toFixed(2).replace(".", ",") + " €";
  let righe = [];
  try { righe = JSON.parse(localStorage.getItem("taj-carrello") || "[]"); } catch (_) { righe = []; }
  const salva = () => { try { localStorage.setItem("taj-carrello", JSON.stringify(righe)); } catch (_) {} };
  const fisso = document.querySelector(".car-fisso"), lista = car.querySelector(".car-lista");
  const totale = () => righe.reduce((t, r) => t + r.p * r.q, 0);
  const form = car.querySelector(".car-form");

  const disegna = () => {
    const n = righe.reduce((t, r) => t + r.q, 0);
    fisso.querySelector(".car-n").textContent = n;
    fisso.querySelector(".car-tot").textContent = euro(totale());
    car.querySelector(".car-tot2").textContent = euro(totale());
    document.body.classList.toggle("ha-ordine", n > 0);
    car.classList.toggle("vuoto", n === 0);
    car.classList.toggle("con-fast", righe.some((r) => r.id.startsWith("f")));
    lista.innerHTML = righe.map((r, i) => `<li><div><b>${r.nome}</b><span>${euro(r.p * r.q)}</span></div>
      <div class="car-q"><button data-i="${i}" data-d="-1" aria-label="Meno">−</button><em>${r.q}</em><button data-i="${i}" data-d="1" aria-label="Più">+</button></div></li>`).join("");
  };

  document.querySelectorAll(".agg").forEach((b) => b.addEventListener("click", () => {
    const r = righe.find((x) => x.id === b.dataset.id);
    if (r) r.q++; else righe.push({ id: b.dataset.id, nome: b.dataset.nome, p: +b.dataset.prezzo, q: 1 });
    salva(); disegna();
    b.classList.add("fatto"); fisso.classList.remove("salta"); void fisso.offsetWidth; fisso.classList.add("salta");
    setTimeout(() => b.classList.remove("fatto"), 900);
  }));
  lista.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    const r = righe[+b.dataset.i]; r.q += +b.dataset.d;
    if (r.q <= 0) righe.splice(+b.dataset.i, 1);
    salva(); disegna();
  });

  const apri = (si) => { document.body.classList.toggle("car-aperto", si); car.setAttribute("aria-hidden", String(!si)); };
  fisso.addEventListener("click", () => apri(true));
  car.querySelector(".car-chiudi").addEventListener("click", () => apri(false));
  document.querySelector(".car-velo").addEventListener("click", () => apri(false));
  addEventListener("keydown", (ev) => { if (ev.key === "Escape") apri(false); });

  const conFast = () => righe.some((r) => r.id.startsWith("f"));
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!righe.length) return;
    const nome = form.nome.value.trim();
    form.nome.classList.toggle("errore", !nome);
    if (!nome) return;
    const L = ur() ? "ur" : en() ? "en" : "it";
    const W = {
      it: ["Nuovo ordine dal sito · Taj Mahal", "Totale", "Ritiro al ristorante", "Nome", "Orario di ritiro", "Bibita e salse", "Note", "Pago al ritiro (contanti o carta)"],
      en: ["New order from the website · Taj Mahal", "Total", "Pick up at the restaurant", "Name", "Pick up time", "Drink and sauces", "Notes", "Payment when I pick up (cash or card)"],
      ur: ["ویب سائٹ سے نیا آرڈر · Taj Mahal", "کل", "ریسٹورنٹ سے وصولی", "نام", "وصولی کا وقت", "مشروب اور ساسز", "نوٹس", "ادائیگی وصولی پر (نقد یا کارڈ)"],
    }[L];
    const t = [W[0], ""]
      .concat(righe.map((r) => `${r.q} × ${r.nome} · ${euro(r.p * r.q)}`))
      .concat(["", `${W[1]}: ${euro(totale())}`, "", W[2], `${W[3]}: ${nome}`]);
    if (form.orario.value.trim()) t.push(`${W[4]}: ${form.orario.value.trim()}`);
    if (conFast() && form.bibita.value.trim()) t.push(`${W[5]}: ${form.bibita.value.trim()}`);
    if (form.note.value.trim()) t.push(`${W[6]}: ${form.note.value.trim()}`);
    t.push("", W[7]);
    location.href = `https://wa.me/${car.dataset.wa}?text=${encodeURIComponent(t.join("\n"))}`;   // apre WhatsApp anche dai browser interni di Instagram e Facebook
  });
  disegna();
})();

// bottoni fissi in basso: spariscono quando si scorre in giù (non coprono piatti e «+»), tornano appena si risale
(() => {
  let y = scrollY, ok = false, ferma;
  addEventListener("scroll", () => {
    clearTimeout(ferma); ferma = setTimeout(() => document.body.classList.remove("scende"), 900);   // fermo = tornano
    if (ok) return; ok = true;
    requestAnimationFrame(() => {
      const n = scrollY, giu = n > y + 4 && n > 300, su = n < y - 4;
      if (giu) document.body.classList.add("scende"); else if (su || n <= 300) document.body.classList.remove("scende");
      y = n; ok = false;
    });
  }, { passive: true });
})();
