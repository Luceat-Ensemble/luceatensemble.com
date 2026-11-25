// Luceat - comportamenti del sito (senza JS tutto funziona lo stesso: link e immagini normali).

// 0. Menu a panino sul telefono: apre/chiude la lista del menu.
document.querySelectorAll('.menu-btn').forEach(function (b) {
  var testata = b.closest('.testata');
  b.addEventListener('click', function () {
    var aperta = testata.classList.toggle('aperta');
    b.setAttribute('aria-expanded', aperta ? 'true' : 'false');
  });
});

// 1. Immagini in sovrapposizione a schermo intero, con scorrimento (dito, frecce, tastiera).
//    Ogni gruppo (.flyer o .galleria) diventa una sequenza; i link sono a.a5 o a.lb.
document.querySelectorAll('.flyer, .galleria').forEach(function (gruppo) {
  var link = Array.prototype.slice.call(gruppo.querySelectorAll('a.a5, a.lb'));
  if (!link.length || !window.HTMLDialogElement) return;

  var d = document.createElement('dialog');
  d.className = 'lightbox';
  d.innerHTML = '<div class="lb-scorri"></div>' +
    '<button class="lb-chiudi" aria-label="Chiudi">&times;</button>' +
    (link.length > 1 ? '<button class="lb-prec" aria-label="Precedente">&#8249;</button>' +
      '<button class="lb-succ" aria-label="Successivo">&#8250;</button>' : '');
  var scorri = d.querySelector('.lb-scorri');
  link.forEach(function (a) {
    var img = document.createElement('img');
    img.alt = a.getAttribute('aria-label') || '';
    img.dataset.src = a.href;
    scorri.appendChild(img);
  });
  document.body.appendChild(d);

  function vai(i) {
    i = Math.max(0, Math.min(link.length - 1, i));
    scorri.scrollTo({ left: i * scorri.clientWidth, behavior: 'smooth' });
  }
  function attuale() { return Math.round(scorri.scrollLeft / scorri.clientWidth); }

  link.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      scorri.querySelectorAll('img').forEach(function (img) { if (!img.src) img.src = img.dataset.src; });
      d.showModal();
      scorri.scrollLeft = i * scorri.clientWidth;
    });
  });
  d.querySelector('.lb-chiudi').addEventListener('click', function () { d.close(); });
  if (link.length > 1) {
    d.querySelector('.lb-prec').addEventListener('click', function () { vai(attuale() - 1); });
    d.querySelector('.lb-succ').addEventListener('click', function () { vai(attuale() + 1); });
  }
  d.addEventListener('click', function (e) { if (e.target === d || e.target === scorri) d.close(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') vai(attuale() - 1);
    if (e.key === 'ArrowRight') vai(attuale() + 1);
  });
});

// 3. Modulo EmailOctopus: le scelte della Quota ("p - CHF 50") diventano dinamica + importo, come nella tabella.
//    Il modulo e' generato da EmailOctopus dopo il caricamento: lo osservo e ridecoro se lo ridisegna.
(function () {
  var box = document.querySelector('.eo-modulo');
  if (!box || !window.MutationObserver) return;
  // Non tocco i nodi del modulo (li gestisce il suo script): nascondo l'etichetta via CSS e aggiungo accanto la mia.
  var giri = 0, attesa = null, obs;
  // traduzione del modulo (in EmailOctopus e' in italiano) secondo la lingua della pagina
  var T = {
    de: { 'Nome': 'Vorname', 'Cognome': 'Nachname', 'Indirizzo e-mail': 'E-Mail-Adresse', 'Quota': 'Beitrag', 'Aderisci': 'Beitreten', 'ADERISCI': 'BEITRETEN', 'solo newsletter': 'nur Newsletter' },
    en: { 'Nome': 'First name', 'Cognome': 'Last name', 'Indirizzo e-mail': 'Email address', 'Quota': 'Contribution', 'Aderisci': 'Join', 'ADERISCI': 'JOIN', 'solo newsletter': 'newsletter only' }
  }[document.documentElement.lang];
  function traduci() {
    if (!T) return;
    box.querySelectorAll('input[placeholder]').forEach(function (i) { var v = T[i.placeholder.trim()]; if (v) i.placeholder = v; });
    box.querySelectorAll('input[type=submit]').forEach(function (i) { var v = T[i.value.trim()]; if (v) i.value = v; });
    var w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { var v = T[n.nodeValue.trim()]; if (v) n.nodeValue = v; }
  }
  function decora() {
    obs.disconnect();
    traduci();
    box.querySelectorAll('[class*="_input-radio__wrap"]').forEach(function (w) {
      if (w.querySelector('.q-txt')) return;
      var l = w.querySelector('label[class*="_input-radio__label"]');
      if (!l) return;
      var t = l.textContent.trim(), m = t.match(/^(fff|ff|mf|f|p)\s*-\s*(.+)$/);
      var s = document.createElement('span');
      s.className = 'q-txt';
      s.innerHTML = m ? '<span class="q-dyn">' + m[1] + '</span><span class="q-chf">' + m[2] + '</span>'
                      : '<span class="q-solo">' + t + '</span>';
      w.classList.add('q-scelta');
      w.appendChild(s);
    });
    traduci();
    if (++giri < 40) obs.observe(box, { childList: true, subtree: true });
  }
  obs = new MutationObserver(function () { clearTimeout(attesa); attesa = setTimeout(decora, 80); });
  obs.observe(box, { childList: true, subtree: true });
})();

// 2. Video YouTube caricati solo al clic (niente cookie di YouTube prima del clic).
document.querySelectorAll('.video[data-id]').forEach(function (v) {
  v.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + v.dataset.id + '?autoplay=1&rel=0';
    f.title = v.getAttribute('aria-label') || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    v.replaceWith(f);
  });
});
