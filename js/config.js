// Prism Agency — unico punto di configurazione per contatti e dati sensibili.
// Aggiorna qui i valori: js/apply-config.js li applica agli elementi con
// [data-config="..."] presenti nella pagina (footer incluso, vedi partials/footer.html).
// Campi lasciati vuoti ("" o []) NON vengono mostrati: nessun dato inventato.
window.SITE_CONFIG = {
  // Contatti — oggi email Gmail e cellulare personale, da aggiornare qui quando
  // saranno disponibili un'email con dominio proprio e un numero dedicato.
  email: "prismagencybusiness@gmail.com",
  phoneDisplay: "+39 388 639 1145",
  phoneE164: "393886391145",
  whatsappMessage: "Ciao, vorrei informazioni su una consulenza gratuita.",

  // Dati legali — vuoti finché non c'è una Partita IVA attiva.
  // Finché "partitaIva" e "titolareTrattamento" sono vuoti, le pagine legali
  // mostrano "[DA COMPILARE]" nei punti relativi (vedi privacy/index.html).
  partitaIva: "",
  titolareTrattamento: "",

  // Referente — se vuoto, /chi-siamo non viene creata (nessun dato inventato).
  referente: { nome: "", ruolo: "", bio: "", foto: "" },

  // Testimonianze/portfolio — se vuoto, la sezione dedicata non viene renderizzata.
  testimonianze: [],

  // Analytics — se l'ID è vuoto, il relativo script non viene caricato affatto.
  ga4Id: "",
  clarityId: "",
};
