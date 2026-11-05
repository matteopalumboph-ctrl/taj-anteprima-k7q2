// entrate allo scorrimento, isola che si nasconde scendendo, scheda attiva del menù, menù del telefono
(() => {
  const io = new IntersectionObserver((voci) => voci.forEach((v) => {
    if (v.isIntersecting) { v.target.classList.add("dentro"); io.unobserve(v.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rivela").forEach((el) => io.observe(el));

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
      ultimo = y; attesa = false;
    });
  }, { passive: true });

  const schede = document.querySelectorAll(".schede a");
  const sezioni = new IntersectionObserver((voci) => voci.forEach((v) => {
    if (!v.isIntersecting) return;
    schede.forEach((a) => {
      const on = a.dataset.sz === v.target.id.slice(2);
      a.classList.toggle("attiva", on);
      if (on) a.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".sz").forEach((s) => sezioni.observe(s));

  const hamb = document.querySelector(".hamb");
  const chiudi = () => { document.body.classList.remove("aperto"); hamb.setAttribute("aria-expanded", "false"); };
  hamb.addEventListener("click", () => {
    const aperto = document.body.classList.toggle("aperto");
    hamb.setAttribute("aria-expanded", String(aperto));
  });
  document.querySelectorAll(".velo a").forEach((a) => a.addEventListener("click", chiudi));
})();
