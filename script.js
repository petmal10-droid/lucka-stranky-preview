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

  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  if (hero && heroArt && !prefersReducedMotion) {
    let parallaxTicking = false;

    const updateHeroParallax = () => {
      const heroRect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isHeroVisible = heroRect.bottom > 0 && heroRect.top < viewportHeight;

      if (!isHeroVisible) {
        parallaxTicking = false;
        return;
      }

      const scrollProgress = Math.min(Math.max(-heroRect.top, 0), hero.offsetHeight);
      const parallaxY = scrollProgress * 0.42;

      heroArt.style.setProperty("--hero-parallax-y", `${parallaxY.toFixed(1)}px`);
      parallaxTicking = false;
    };

    const requestHeroParallaxUpdate = () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(updateHeroParallax);
    };

    updateHeroParallax();
    window.addEventListener("scroll", requestHeroParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestHeroParallaxUpdate);
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

  const inlineVideos = document.querySelectorAll("video[autoplay][muted]");
  inlineVideos.forEach((video) => {
    video.controls = false;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("controls");

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  });
});
