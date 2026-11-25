// Luceat - flyer in sovrapposizione: clic su fronte o retro, si apre il flyer in alta risoluzione,
// scorrimento (dito, frecce, tastiera) tra fronte e retro. Senza JS i link aprono l'immagine.
document.querySelectorAll('.flyer').forEach(function (flyer) {
  var lati = Array.prototype.slice.call(flyer.querySelectorAll('a.a5'));
  if (!lati.length || !window.HTMLDialogElement) return;

  var d = document.createElement('dialog');
  d.className = 'lightbox';
  d.innerHTML = '<div class="lb-scorri"></div>' +
    '<button class="lb-chiudi" aria-label="Chiudi">&times;</button>' +
    '<button class="lb-prec" aria-label="Precedente">&#8249;</button>' +
    '<button class="lb-succ" aria-label="Successivo">&#8250;</button>';
  var scorri = d.querySelector('.lb-scorri');
  lati.forEach(function (a) {
    var img = document.createElement('img');
    img.alt = a.getAttribute('aria-label') || '';
    img.dataset.src = a.href;
    scorri.appendChild(img);
  });
  document.body.appendChild(d);

  function vai(i) {
    i = Math.max(0, Math.min(lati.length - 1, i));
    scorri.scrollTo({ left: i * scorri.clientWidth, behavior: 'smooth' });
  }
  function attuale() { return Math.round(scorri.scrollLeft / scorri.clientWidth); }

  lati.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      scorri.querySelectorAll('img').forEach(function (img) { if (!img.src) img.src = img.dataset.src; });
      d.showModal();
      scorri.scrollLeft = i * scorri.clientWidth;
    });
  });
  d.querySelector('.lb-chiudi').addEventListener('click', function () { d.close(); });
  d.querySelector('.lb-prec').addEventListener('click', function () { vai(attuale() - 1); });
  d.querySelector('.lb-succ').addEventListener('click', function () { vai(attuale() + 1); });
  d.addEventListener('click', function (e) { if (e.target === d || e.target === scorri) d.close(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') vai(attuale() - 1);
    if (e.key === 'ArrowRight') vai(attuale() + 1);
  });
});
