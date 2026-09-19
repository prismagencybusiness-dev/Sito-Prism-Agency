// Applica window.SITE_CONFIG agli elementi [data-config] della pagina.
// I valori statici gia' presenti nell'HTML restano corretti anche se questo
// script non gira (niente JS, rete lenta): questo e' un livello di sicurezza,
// non l'unica fonte dei link — cosi' i contatti non dipendono dal JS.
(function () {
  "use strict";

  function applyConfig(root) {
    var cfg = window.SITE_CONFIG;
    if (!cfg) return;
    var scope = root || document;

    scope.querySelectorAll('[data-config="email"]').forEach(function (el) {
      if (!cfg.email) return;
      el.textContent = cfg.email;
      if (el.tagName === "A") el.href = "mailto:" + cfg.email;
    });

    scope.querySelectorAll('[data-config="phone"]').forEach(function (el) {
      if (!cfg.phoneDisplay) return;
      el.textContent = cfg.phoneDisplay;
      if (el.tagName === "A") el.href = "tel:+" + cfg.phoneE164;
    });

    scope.querySelectorAll('[data-config="whatsapp"]').forEach(function (el) {
      if (!cfg.phoneE164 || el.tagName !== "A") return;
      var text = encodeURIComponent(cfg.whatsappMessage || "");
      el.href = "https://wa.me/" + cfg.phoneE164 + (text ? "?text=" + text : "");
    });
  }

  window.applySiteConfig = applyConfig;
  document.addEventListener("DOMContentLoaded", function () {
    applyConfig(document);
  });
})();
