// Carica il footer condiviso (partials/footer.html) dentro <footer data-footer-slot>.
// Percorso assoluto (/partials/...) cosi' funziona anche dalle pagine annidate
// (es. /servizi/siti-web/). Il footer e' sotto la piega: se il fetch e' lento
// o fallisce, non c'e' contenuto visibile che si sposta (nessun impatto CLS).
(function () {
  "use strict";
  var slot = document.querySelector("[data-footer-slot]");
  if (!slot) return;

  fetch("/partials/footer.html")
    .then(function (res) {
      if (!res.ok) throw new Error("footer partial " + res.status);
      return res.text();
    })
    .then(function (html) {
      slot.innerHTML = html;
      var yearEl = slot.querySelector("[data-year]");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
      if (window.applySiteConfig) window.applySiteConfig(slot);
    })
    .catch(function () {
      // Silenzioso: meglio nessun footer che markup rotto a meta'.
    });
})();
