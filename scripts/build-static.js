#!/usr/bin/env node
// Prism Agency — inietta header/footer statici in ogni pagina HTML.
// Nessuna dipendenza esterna (solo fs/path). Il footer NON viene più
// caricato via fetch a runtime: questo script scrive l'HTML reale,
// letto una sola volta da js/config.js e scripts/templates/footer.html.
//
// Uso:
//   node scripts/build-static.js
// Da rilanciare (e da rifare commit dei file .html) ogni volta che si
// aggiornano js/config.js o scripts/templates/footer.html.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readSiteConfig() {
  const src = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8");
  const match = src.match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*?\});/);
  if (!match) throw new Error("Non trovo window.SITE_CONFIG in js/config.js");
  // File locale e di nostra proprietà: eval e' sicuro qui (non input utente/rete).
  // eslint-disable-next-line no-eval
  return eval("(" + match[1] + ")");
}

function socialIconsHtml(cfg) {
  const icons = [];
  if (cfg.instagramUrl) {
    icons.push(
      `          <a href="${cfg.instagramUrl}" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none"/></svg></a>`
    );
  }
  if (cfg.facebookUrl) {
    icons.push(
      `          <a href="${cfg.facebookUrl}" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M13.5 20v-6h2l.4-2.6h-2.4V9.6c0-.8.3-1.4 1.5-1.4h1V5.9c-.5 0-1.4-.1-2.2-.1-2.2 0-3.5 1.3-3.5 3.7v2h-2.2V14h2.2v6"/></svg></a>`
    );
  }
  return icons.join("\n");
}

function renderFooter(cfg) {
  const tpl = fs.readFileSync(path.join(ROOT, "scripts/templates/footer.html"), "utf8");
  return tpl
    .replace("{{SOCIAL_ICONS}}", socialIconsHtml(cfg))
    .replace("{{EMAIL_HREF}}", "mailto:" + cfg.email)
    .replace("{{EMAIL}}", cfg.email)
    .replace("{{PHONE_HREF}}", "tel:+" + cfg.phoneE164)
    .replace("{{PHONE_DISPLAY}}", cfg.phoneDisplay)
    .replace("{{YEAR}}", String(new Date().getFullYear()));
}

function findHtmlPages(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlPages(full, out);
    } else if (entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function injectFooter(html, footerHtml) {
  const footerRe = /<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/;
  if (!footerRe.test(html)) return null;
  let out = html.replace(footerRe, footerHtml.trim());
  // Migrazione una tantum: il footer non e' piu' caricato via fetch.
  out = out.replace(/[ \t]*<script src="\/js\/include-footer\.js"><\/script>\r?\n/, "");
  return out;
}

function main() {
  const cfg = readSiteConfig();
  const footerHtml = renderFooter(cfg);

  const skipDirs = new Set(["node_modules", "scripts", "assets", "css", "js", ".git", ".claude"]);
  const pages = [];
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      findHtmlPages(path.join(ROOT, entry.name), pages);
    } else if (entry.name.endsWith(".html")) {
      pages.push(path.join(ROOT, entry.name));
    }
  }

  let changed = 0;
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const updated = injectFooter(html, footerHtml);
    if (updated === null) {
      console.log("skip (nessun <footer class=\"site-footer\">): " + path.relative(ROOT, file));
      continue;
    }
    if (updated !== html) {
      fs.writeFileSync(file, updated, "utf8");
      changed++;
      console.log("aggiornato: " + path.relative(ROOT, file));
    } else {
      console.log("invariato: " + path.relative(ROOT, file));
    }
  }
  console.log(`\nFatto. ${changed} pagina/e aggiornata/e su ${pages.length} trovate.`);
}

main();
