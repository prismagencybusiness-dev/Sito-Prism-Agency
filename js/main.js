// Prism Agency — shared site behaviour: mobile nav, active link, scroll reveal,
// service pre-fill from URL, contact form submission.

(function () {
  "use strict";

  /* ---- mobile nav ---- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---- active nav link ---- */
  const here = document.body.dataset.page;
  if (here) {
    document.querySelectorAll(".nav-links a[data-page]").forEach((a) => {
      if (a.dataset.page === here) a.classList.add("is-active");
    });
  }

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- footer year ---- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- pre-fill "servizio d'interesse" from ?servizio= in the URL,
     used by the CTA links on servizi.html ---- */
  const serviceSelect = document.querySelector("#servizio");
  if (serviceSelect) {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("servizio");
    if (wanted) {
      const match = Array.from(serviceSelect.options).find((o) => o.value === wanted);
      if (match) serviceSelect.value = wanted;
    }
  }

  /* ---- contact form ---- */
  const form = document.querySelector("#contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');

    const showStatus = (kind, message) => {
      status.textContent = message;
      status.classList.remove("is-success", "is-error");
      status.classList.add("is-visible", kind === "success" ? "is-success" : "is-error");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const action = form.getAttribute("action") || "";
      if (!action || action.includes("YOUR_FORM_ID")) {
        showStatus(
          "error",
          "Il form non è ancora collegato a un endpoint di invio. Configura Formspree (vedi commento in contatti.html) prima di pubblicare il sito."
        );
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Invio in corso...";

      try {
        const response = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.reset();
          showStatus("success", "Messaggio inviato. Ti risponderemo entro 24 ore lavorative.");
        } else {
          showStatus("error", "Non siamo riusciti a inviare il messaggio. Riprova o scrivici direttamente via email.");
        }
      } catch (err) {
        showStatus("error", "Connessione non riuscita. Controlla la rete e riprova.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }
})();
