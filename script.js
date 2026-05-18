document.addEventListener("DOMContentLoaded", async () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  await loadCmsContent();
  initContactForm();
  initReveal(prefersReducedMotion);
  initHeader();
  initMobileMenu();
  initHeroParallax(prefersReducedMotion);
  initActiveNavigation();
  initFaq();
  initTestimonials(prefersReducedMotion);
  initInlineVideos();
});

const getValue = (source, path) =>
  path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), source);

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (typeof text === "string") element.textContent = text;
  return element;
};

const shuffleItems = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

const chunkItems = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const normalizeImagePath = (path) => {
  if (!path || typeof path !== "string") return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return path.replace(/^\.?\//, "");
};

const encodeMailtoSubject = (subject) => encodeURIComponent(subject || "Poptávka z webu");

const setFormStatus = (form, message, type = "info") => {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.textContent = message || "";
  status.hidden = !message;
  status.dataset.status = type;
};

const loadRecaptchaScript = () => {
  if (document.querySelector('script[src*="google.com/recaptcha/api.js"]')) return;

  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/api.js";
  script.async = true;
  script.defer = true;
  document.head.append(script);
};

const resetRecaptcha = () => {
  if (window.grecaptcha && typeof window.grecaptcha.reset === "function") {
    window.grecaptcha.reset();
  }
};

const applyImage = (image, target) => {
  if (!target || !image || !image.src) return;

  const img = target.matches("img") ? target : target.querySelector("img");
  if (!img) return;

  const fallbackSrc = img.dataset.fallbackSrc || img.getAttribute("src");
  img.dataset.fallbackSrc = fallbackSrc;
  img.src = normalizeImagePath(image.src);
  img.alt = image.alt || img.alt || "";
  img.onerror = () => {
    if (img.src !== fallbackSrc) img.src = fallbackSrc;
  };
};

const applyTextFields = (content) => {
  document.querySelectorAll("[data-cms-text]").forEach((element) => {
    const value = getValue(content, element.dataset.cmsText);
    if (typeof value === "string" && value.trim()) element.textContent = value;
  });
};

const applyVisibilityFields = (content) => {
  document.querySelectorAll("[data-cms-active]").forEach((element) => {
    const value = getValue(content, element.dataset.cmsActive);
    if (typeof value !== "boolean") return;

    element.hidden = !value;
    if (element.dataset.cmsLayoutToggle === "section-grid-single") {
      element.closest(".section-grid")?.classList.toggle("section-grid--single", !value);
    }
  });
};

const applyBrand = (brand = {}) => {
  if (!brand.logo?.src) return;

  document.querySelectorAll("[data-cms-logo]").forEach((logo) => {
    const fallbackSrc = logo.dataset.fallbackSrc || logo.getAttribute("src");
    logo.dataset.fallbackSrc = fallbackSrc;
    logo.src = normalizeImagePath(brand.logo.src);
    logo.alt = brand.logo.alt || logo.alt || "Logo";
    logo.onerror = () => {
      if (logo.src !== fallbackSrc) logo.src = fallbackSrc;
    };
  });
};

const applyHero = (hero = {}) => {
  const points = document.querySelector('[data-cms-list="hero.points"]');
  if (points && Array.isArray(hero.points) && hero.points.length) {
    points.replaceChildren(...hero.points.filter(Boolean).map((point) => createElement("li", "", point)));
  }
};

const renderFeatureStrip = (features = []) => {
  const container = document.querySelector('[data-cms-list="microcirculation.features"]');
  if (!container || !Array.isArray(features) || !features.length) return;
  const visibleFeatures = features.filter((feature) => feature && feature.active !== false);
  if (!visibleFeatures.length) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.dataset.count = String(visibleFeatures.length);

  const fallbackImages = Array.from(container.querySelectorAll("img")).map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
  }));

  const cards = visibleFeatures.map((feature, index) => {
    const article = createElement("article");
    const img = createElement("img");
    const fallbackImage = fallbackImages[index] || fallbackImages[0] || {};
    img.src = normalizeImagePath(feature.image?.src || fallbackImage.src || "");
    img.alt = feature.image?.alt || fallbackImage.alt || "";
    img.dataset.fallbackSrc = normalizeImagePath(fallbackImage.src || img.src);
    img.onerror = () => {
      img.src = img.dataset.fallbackSrc;
    };

    const copy = createElement("div");
    copy.append(createElement("h3", "", feature.title || ""), createElement("p", "", feature.text || ""));
    article.append(img, copy);
    return article;
  });

  container.replaceChildren(...cards);
};

const renderProofs = (proofs = []) => {
  const container = document.querySelector('[data-cms-list="bemer.proofs"]');
  if (!container || !Array.isArray(proofs) || !proofs.length) return;

  const cards = proofs.map((proof) => {
    const article = createElement("article", `bemer-proof-card${proof.link?.url ? " bemer-proof-card--source" : ""}`);
    article.append(createElement("strong", "", proof.value || ""), createElement("span", "", proof.text || ""));
    if (proof.link?.url && proof.link?.label) {
      const link = createElement("a", "", proof.link.label);
      link.href = proof.link.url;
      link.target = "_blank";
      link.rel = "noopener";
      article.append(link);
    }
    return article;
  });

  container.replaceChildren(...cards);
};

const renderHelpCards = (cards = []) => {
  const container = document.querySelector('[data-cms-list="support.cards"]');
  if (!container || !Array.isArray(cards) || !cards.length) return;

  container.replaceChildren(
    ...cards.map((card) => {
      const article = createElement("article", "help-card");
      const icon = createElement("span", "help-icon");
      icon.setAttribute("aria-hidden", "true");
      if (card.image?.src) {
        icon.classList.add("help-icon--custom");
        const img = createElement("img");
        img.src = normalizeImagePath(card.image.src);
        img.alt = card.image.alt || "";
        icon.append(img);
      }
      article.append(icon, createElement("h3", "", card.title || ""), createElement("p", "", card.text || ""));
      return article;
    })
  );
};

const renderSteps = (steps = []) => {
  const container = document.querySelector('[data-cms-list="cooperation.steps"]');
  if (!container || !Array.isArray(steps)) return;
  if (!steps.length) {
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.dataset.count = String(Math.min(steps.length, 4));

  container.replaceChildren(
    ...steps.map((step, index) => {
      const article = createElement("article", "audience-card");
      const number = createElement("span", "process-number", step.number || String(index + 1).padStart(2, "0"));
      article.append(number, createElement("h3", "", step.title || ""), createElement("p", "", step.text || ""));
      return article;
    })
  );
};

const renderFaq = (items = []) => {
  const container = document.querySelector('[data-cms-list="faq.items"]');
  if (!container || !Array.isArray(items) || !items.length) return;

  container.replaceChildren(
    ...items.map((item, index) => {
      const id = `faq-answer-${index + 1}`;
      const article = createElement("article", "faq-entry faq-item");
      const button = createElement("button", "faq-question");
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", id);
      const icon = createElement("span", "faq-icon");
      icon.setAttribute("aria-hidden", "true");
      button.append(createElement("span", "", item.question || ""), icon);

      const answer = createElement("div", "faq-answer");
      answer.id = id;
      answer.append(createElement("p", "", item.answer || ""));
      article.append(button, answer);
      return article;
    })
  );
};

const renderTestimonials = (items = []) => {
  const section = document.querySelector("#testimonials");
  const carousel = document.querySelector('[data-cms-list="testimonials.items"]');
  if (!section || !carousel || !Array.isArray(items)) return;

  if (!items.length) {
    section.hidden = true;
    return;
  }

  const orderedItems = shuffleItems(items);
  const slides = chunkItems(orderedItems, 2).map((group, slideIndex) => {
    const slide = createElement("div", `testimonial-slide${slideIndex === 0 ? " is-active" : ""}`);
    slide.dataset.testimonialSlide = String(slideIndex);
    if (slideIndex > 0) slide.hidden = true;

    const grid = createElement("div", "testimonial-grid");
    group.forEach((testimonial) => {
      const quote = createElement("blockquote", "testimonial-card");
      const mark = createElement("span", "", "“");
      mark.setAttribute("aria-hidden", "true");
      const footer = createElement("footer");
      footer.append(createElement("strong", "", testimonial.name || ""), createElement("small", "", testimonial.context || ""));
      quote.append(
        mark,
        createElement("div", "testimonial-tag", testimonial.tag || ""),
        createElement("p", "", testimonial.text || ""),
        footer
      );
      grid.append(quote);
    });

    slide.append(grid);
    return slide;
  });

  const dots = createElement("div", "testimonial-dots");
  dots.setAttribute("aria-label", "Přepnout reference");
  if (slides.length > 1) {
    slides.forEach((_, index) => {
      const dot = createElement("button", `testimonial-dot${index === 0 ? " is-active" : ""}`);
      dot.type = "button";
      dot.dataset.testimonialDot = String(index);
      dot.setAttribute("aria-label", `Zobrazit reference ${index + 1}`);
      dot.setAttribute("aria-current", String(index === 0));
      dots.append(dot);
    });
  }

  carousel.replaceChildren(...slides, dots);
};

const renderLegalBlocks = (blocks = []) => {
  const container = document.querySelector('[data-cms-list="legal.blocks"]');
  if (!container || !Array.isArray(blocks) || !blocks.length) return;

  container.replaceChildren(
    ...blocks.map((block) => {
      const article = createElement("article");
      article.append(createElement("h3", "", block.title || ""), createElement("p", "", block.text || ""));
      return article;
    })
  );
};

const applyContact = (contact = {}) => {
  const form = document.querySelector("[data-contact-form]");
  const formSettings = contact.form || {};
  const recipientEmail = formSettings.recipientEmail || contact.email;

  if (contact.email) {
    const email = document.querySelector('[data-cms-contact="email"]');
    if (email) {
      email.textContent = contact.email;
      email.href = `mailto:${contact.email}`;
    }
  }

  if (form && recipientEmail) {
    const endpoint = formSettings.endpoint?.trim();
    const subject = encodeMailtoSubject(formSettings.subject);
    form.action = endpoint || `mailto:${recipientEmail}?subject=${subject}`;
    form.method = "post";
    form.enctype = endpoint ? "multipart/form-data" : "text/plain";
    form.dataset.successMessage = formSettings.successMessage || "Děkujeme, zpráva byla odeslána.";
    form.dataset.mailtoMessage =
      formSettings.mailtoMessage || "Otevře se vám e-mailový klient s připravenou zprávou.";
    form.dataset.errorMessage =
      formSettings.errorMessage || "Odeslání se nepodařilo. Zkuste to prosím znovu nebo napište přímo na e-mail.";
    form.dataset.recaptchaMessage =
      formSettings.recaptchaMessage || "Potvrďte prosím, že nejste robot.";
    form.dataset.hasEndpoint = String(Boolean(endpoint));
  }

  const recaptcha = formSettings.recaptcha || {};
  const recaptchaContainer = document.querySelector("[data-recaptcha-container]");
  if (recaptchaContainer) {
    const shouldShowRecaptcha = Boolean(recaptcha.enabled && recaptcha.siteKey);
    recaptchaContainer.hidden = !shouldShowRecaptcha;
    recaptchaContainer.replaceChildren();

    if (shouldShowRecaptcha) {
      const recaptchaElement = createElement("div", "g-recaptcha");
      recaptchaElement.dataset.sitekey = recaptcha.siteKey;
      recaptchaContainer.append(recaptchaElement);
      loadRecaptchaScript();
    }
  }

  if (contact.phone) {
    const phone = document.querySelector('[data-cms-contact="phone"]');
    if (phone) {
      phone.textContent = contact.phone;
      phone.href = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
    }
  }

  const profilePhoto = document.querySelector('[data-cms-image-wrapper="contact.profile.image"]');
  if (profilePhoto && contact.profile?.image?.src) {
    const img = createElement("img");
    img.src = normalizeImagePath(contact.profile.image.src);
    img.alt = contact.profile.image.alt || contact.profile.name || "Profilová fotografie";
    img.onerror = () => {
      profilePhoto.replaceChildren(document.createTextNode((contact.profile.name || "L").trim().charAt(0)));
    };
    profilePhoto.replaceChildren(img);
    profilePhoto.removeAttribute("aria-hidden");
  }
};

const initContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    const recaptchaContainer = form.querySelector("[data-recaptcha-container]");
    const recaptchaResponse = form.querySelector('[name="g-recaptcha-response"]');
    const recaptchaRequired = recaptchaContainer && !recaptchaContainer.hidden;

    if (recaptchaRequired && !recaptchaResponse?.value) {
      event.preventDefault();
      setFormStatus(form, form.dataset.recaptchaMessage, "error");
      return;
    }

    if (form.dataset.hasEndpoint !== "true") {
      setFormStatus(form, form.dataset.mailtoMessage, "info");
      return;
    }

    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    setFormStatus(form, "", "info");

    try {
      const response = await fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Form endpoint failed: ${response.status}`);

      form.reset();
      resetRecaptcha();
      setFormStatus(form, form.dataset.successMessage, "success");
    } catch (error) {
      console.warn("Contact form could not be submitted.", error);
      resetRecaptcha();
      setFormStatus(form, form.dataset.errorMessage, "error");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
};

const applyCmsContent = (content) => {
  applyTextFields(content);
  applyVisibilityFields(content);
  applyBrand(content.brand);
  applyHero(content.hero);
  renderFeatureStrip(content.microcirculation?.features);
  renderProofs(content.bemer?.proofs);
  applyImage(content.bemer?.image, document.querySelector('[data-cms-image-wrapper="bemer.image"]'));
  renderHelpCards(content.support?.cards);
  renderSteps(content.cooperation?.steps);
  renderTestimonials(content.testimonials?.items);
  renderFaq(content.faq?.items);
  applyContact(content.contact);
  renderLegalBlocks(content.legal?.blocks);
};

const loadCmsContent = async () => {
  try {
    const response = await fetch("./content/site.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`CMS content failed: ${response.status}`);
    const content = await response.json();
    applyCmsContent(content);
  } catch (error) {
    console.warn("CMS content could not be loaded; using HTML fallback.", error);
  }
};

const initReveal = (prefersReducedMotion) => {
  const revealElements = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!revealElements.length) return;

  if (prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

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
};

const initHeader = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
};

const initMobileMenu = () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-menu");
  if (!header || !toggle || !menu) return;

  const closeMenu = () => {
    header.classList.remove("is-menu-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = header.classList.toggle("is-menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  toggle.addEventListener("click", toggleMenu);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (header.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 681px)").matches) closeMenu();
  });
};

const initHeroParallax = (prefersReducedMotion) => {
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  if (!hero || !heroArt || prefersReducedMotion) return;

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
    heroArt.style.setProperty("--hero-parallax-y", `${(scrollProgress * 0.42).toFixed(1)}px`);
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
};

const initActiveNavigation = () => {
  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const sectionLinks = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return null;

      const section = document.querySelector(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sectionLinks.length) return;

  let ticking = false;

  const setActiveLink = () => {
    const headerOffset = header ? header.offsetHeight + 34 : 120;
    const currentPosition = window.scrollY + headerOffset;
    const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let activeItem = sectionLinks[0];
    sectionLinks.forEach((item) => {
      if (item.section.offsetTop <= currentPosition) activeItem = item;
    });

    if (pageBottom) activeItem = sectionLinks[sectionLinks.length - 1];

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
};

const initFaq = () => {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
};

const initTestimonials = (prefersReducedMotion) => {
  const testimonialSlides = Array.from(document.querySelectorAll("[data-testimonial-slide]"));
  const testimonialDots = Array.from(document.querySelectorAll("[data-testimonial-dot]"));
  if (!testimonialSlides.length || testimonialSlides.length === 1) return;

  let activeTestimonial = 0;
  let testimonialTimer;

  const showTestimonial = (index) => {
    activeTestimonial = index;

    testimonialSlides.forEach((slide) => {
      const isActive = Number(slide.dataset.testimonialSlide) === index;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
    });

    testimonialDots.forEach((dot) => {
      const isActive = Number(dot.dataset.testimonialDot) === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  const startTestimonialTimer = () => {
    if (prefersReducedMotion || testimonialTimer) return;
    testimonialTimer = window.setInterval(() => {
      showTestimonial((activeTestimonial + 1) % testimonialSlides.length);
    }, 7000);
  };

  const stopTestimonialTimer = () => {
    if (!testimonialTimer) return;
    window.clearInterval(testimonialTimer);
    testimonialTimer = undefined;
  };

  testimonialDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopTestimonialTimer();
      showTestimonial(Number(dot.dataset.testimonialDot));
      startTestimonialTimer();
    });
  });

  const carousel = document.querySelector(".testimonial-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopTestimonialTimer);
    carousel.addEventListener("mouseleave", startTestimonialTimer);
    carousel.addEventListener("focusin", stopTestimonialTimer);
    carousel.addEventListener("focusout", startTestimonialTimer);
  }

  startTestimonialTimer();
};

const initInlineVideos = () => {
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
};
