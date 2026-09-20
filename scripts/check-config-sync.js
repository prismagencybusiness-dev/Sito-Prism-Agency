#!/usr/bin/env node
// Prism Agency — verifica che email, telefono/WhatsApp e social scritti
// nei file .html coincidano con js/config.js. Non modifica nulla: segnala
// solo le differenze (utile prima di un deploy, o come step di build in
// netlify.toml — vedi Fase D). Uscita: exit 1 se trova disallineamenti.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readSiteConfig() {
  const src = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8");
  const match = src.match(/window\.SITE_CONFIG\s*=\s*(\{[\s\S]*?\});/);
  if (!match) throw new Error("Non trovo window.SITE_CONFIG in js/config.js");
  // eslint-disable-next-line no-eval
  return eval("(" + match[1] + ")");
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

function collectAllPages() {
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
  return pages;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function main() {
  const cfg = readSiteConfig();
  const expectedEmailHref = "mailto:" + cfg.email;
  const expectedPhoneHref = "tel:+" + cfg.phoneE164;

  const pages = collectAllPages();
  const problems = [];

  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);

    const mailtoHrefs = uniq((html.match(/href="mailto:[^"]*"/g) || []).map((s) => s.slice(6, -1)));
    for (const href of mailtoHrefs) {
      if (href !== expectedEmailHref) {
        problems.push(`${rel}: email "${href}" diversa dal config ("${expectedEmailHref}")`);
      }
    }

    const telHrefs = uniq((html.match(/href="tel:[^"]*"/g) || []).map((s) => s.slice(6, -1)));
    for (const href of telHrefs) {
      if (href !== expectedPhoneHref) {
        problems.push(`${rel}: telefono "${href}" diverso dal config ("${expectedPhoneHref}")`);
      }
    }

    const waHrefs = uniq((html.match(/href="https:\/\/wa\.me\/[^"]*"/g) || []).map((s) => s.slice(6, -1)));
    for (const href of waHrefs) {
      if (!href.startsWith("https://wa.me/" + cfg.phoneE164)) {
        problems.push(`${rel}: link WhatsApp "${href}" non usa il numero del config`);
      }
    }

    const igHrefs = uniq((html.match(/href="https:\/\/(www\.)?instagram\.com\/[^"]*"/g) || []).map((s) => s.slice(6, -1)));
    for (const href of igHrefs) {
      if (!cfg.instagramUrl) {
        problems.push(`${rel}: link Instagram "${href}" presente ma instagramUrl e' vuoto nel config`);
      } else if (href !== cfg.instagramUrl) {
        problems.push(`${rel}: Instagram "${href}" diverso dal config ("${cfg.instagramUrl}")`);
      }
    }

    const fbHrefs = uniq((html.match(/href="https:\/\/(www\.)?facebook\.com\/[^"]*"/g) || []).map((s) => s.slice(6, -1)));
    for (const href of fbHrefs) {
      if (!cfg.facebookUrl) {
        problems.push(`${rel}: link Facebook "${href}" presente ma facebookUrl e' vuoto nel config`);
      } else if (href !== cfg.facebookUrl) {
        problems.push(`${rel}: Facebook "${href}" diverso dal config ("${cfg.facebookUrl}")`);
      }
    }
  }

  if (problems.length) {
    console.error(`\n${problems.length} disallineamento/i tra HTML e js/config.js:\n`);
    problems.forEach((p) => console.error("  - " + p));
    console.error("\nAggiorna js/config.js, poi esegui `npm run build` e fai commit.\n");
    process.exit(1);
  }

  console.log(`OK: email, telefono/WhatsApp e social coincidono con js/config.js in tutte le ${pages.length} pagine.`);
}

main();
