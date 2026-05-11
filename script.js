document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealElements = document.querySelectorAll(".reveal, .reveal-stagger");
  if (revealElements.length) {
    if (prefersReducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      revealElements.forEach((element) => revealObserver.observe(element));
    }
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const sectionLinks = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return null;

      const section = document.querySelector(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (sectionLinks.length) {
    let ticking = false;

    const setActiveLink = () => {
      const headerOffset = header ? header.offsetHeight + 34 : 120;
      const currentPosition = window.scrollY + headerOffset;
      const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      let activeItem = sectionLinks[0];

      sectionLinks.forEach((item) => {
        if (item.section.offsetTop <= currentPosition) {
          activeItem = item;
        }
      });

      if (pageBottom) {
        activeItem = sectionLinks[sectionLinks.length - 1];
      }

      sectionLinks.forEach(({ link }) => {
        link.classList.toggle("is-active", link === activeItem.link);
      });

      ticking = false;
    };

    const requestActiveLinkUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(setActiveLink);
    };

    setActiveLink();
    window.addEventListener("scroll", requestActiveLinkUpdate, { passive: true });
    window.addEventListener("resize", requestActiveLinkUpdate);
  }

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
});
