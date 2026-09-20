// Prism Agency — unico punto di configurazione per contatti e dati sensibili.
// Aggiorna qui i valori:
// - js/apply-config.js li applica a runtime agli elementi [data-config="..."]
//   (es. il pulsante WhatsApp, i link diretti nella pagina Contatti).
// - scripts/build-static.js li inietta come HTML statico nell'header/footer
//   di ogni pagina: dopo una modifica qui, esegui `node scripts/build-static.js`
//   e fai commit anche dei file .html rigenerati.
// Campi lasciati vuoti ("" o []) NON vengono mostrati: nessun dato inventato.
window.SITE_CONFIG = {
  // Contatti — oggi email Gmail e cellulare personale, da aggiornare qui quando
  // saranno disponibili un'email con dominio proprio e un numero dedicato.
  email: "prismagencybusiness@gmail.com",
  phoneDisplay: "+39 388 639 1145",
  phoneE164: "393886391145",
  whatsappMessage: "Ciao, vorrei informazioni su una consulenza gratuita.",

  // Social — Instagram attivo. Facebook compare nel footer solo se questo
  // URL viene compilato (ricorda di rilanciare scripts/build-static.js dopo).
  instagramUrl: "https://www.instagram.com/_prism_agency_/",
  facebookUrl: "",

  // Dati legali — vuoti finché non c'è una Partita IVA attiva.
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
