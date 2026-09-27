document.addEventListener("DOMContentLoaded", async () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initContactForm();
  await loadCmsContent();
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

const web3FormsEndpoint = "https://api.web3forms.com/submit";
const isFormAccessKey = (key) => /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(key || "");

const setFormStatus = (form, message, type = "info") => {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.textContent = message || "";
  status.hidden = !message;
  status.dataset.status = type;
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
    if (typeof value === "string") element.textContent = value;
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
  const art = document.querySelector('.depth-art');
  if (art && hero.visual) {
    for (const key of ['visibility', 'strength', 'detail']) {
      const value = hero.visual[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        art.dataset[key] = String(Math.min(100, Math.max(0, value)));
      }
    }
    if (typeof hero.visual.focus === 'boolean') art.dataset.focus = String(hero.visual.focus);
    art.style.setProperty('--depth-art-opacity', String(Number(art.dataset.visibility) / 100));
    window.dispatchEvent(new Event('hero-visual-change'));
  }
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
      const marker = createElement("span", "process-number", step.number || String(index + 1).padStart(2, "0"));
      marker.setAttribute("aria-hidden", "true");

      if (step.image?.src) {
        marker.classList.add("process-number--custom");
        marker.textContent = "";
        const img = createElement("img");
        img.src = normalizeImagePath(step.image.src);
        img.alt = step.image.alt || "";
        marker.append(img);
      }

      article.append(marker, createElement("h3", "", step.title || ""), createElement("p", "", step.text || ""));
      if (step.price?.active && step.price?.text) {
        const price = createElement("p", `audience-card-price${step.price.bold ? " audience-card-price--bold" : ""}`, step.price.text);
        article.append(price);
      }
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

const renderTestimonials = (items = [], display = {}) => {
  const section = document.querySelector("#testimonials");
  const carousel = document.querySelector('[data-cms-list="testimonials.items"]');
  if (!section || !carousel || !Array.isArray(items)) return;

  if (!items.length) {
    section.hidden = true;
    carousel.replaceChildren();
    return;
  }
  section.hidden = false;

  const orderedItems = shuffleItems(items);
  // Keep the final pair complete without adding a duplicate to CMS content.
  if (orderedItems.length > 1 && orderedItems.length % 2 === 1) {
    orderedItems.push(orderedItems[0]);
  }
  const showTags = display.showTags !== false;
  const showContexts = display.showContexts !== false;
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
      footer.append(createElement("strong", "", testimonial.name || ""));
      if (showContexts && testimonial.contextActive !== false && testimonial.context) {
        footer.append(createElement("small", "", testimonial.context));
      }

      quote.append(mark);
      if (showTags && testimonial.tagActive !== false && testimonial.tag) {
        quote.append(createElement("div", "testimonial-tag", testimonial.tag));
      }
      quote.append(createElement("p", "", testimonial.text || ""), footer);
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

  if (contact.email) {
    const email = document.querySelector('[data-cms-contact="email"]');
    if (email) {
      email.textContent = contact.email;
      email.href = `mailto:${contact.email}`;
    }
  }

  if (form) {
    const accessKey = formSettings.accessKey?.trim() || "";
    form.action = web3FormsEndpoint;
    form.method = "post";
    form.dataset.successMessage = formSettings.successMessage || "Děkujeme, zpráva byla odeslána.";
    form.dataset.errorMessage =
      formSettings.errorMessage || "Odeslání se nepodařilo. Zkuste to prosím znovu nebo napište přímo na e-mail.";
    form.dataset.pendingMessage = formSettings.pendingMessage || "Odesílám zprávu…";
    form.dataset.unavailableMessage = formSettings.unavailableMessage ||
      "Formulář zatím není dostupný. Napište prosím na uvedený e-mail nebo zavolejte.";
    for (const [name, value] of Object.entries({
      access_key: accessKey,
      subject: formSettings.subject || "Poptávka z webu BEMER Lucie",
    })) {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) {
        input.defaultValue = value;
        input.value = value;
      }
    }
    const ready = isFormAccessKey(accessKey);
    form.dataset.ready = String(ready);
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = !ready;
    setFormStatus(form, ready ? "" : form.dataset.unavailableMessage, "error");
  }

  if (contact.phone) {
    const phone = document.querySelector('[data-cms-contact="phone"]');
    if (phone) {
      phone.textContent = contact.phone;
      phone.href = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
    }
  }

  const profilePhoto = document.querySelector('[data-cms-image-wrapper="contact.profile.image"]');
  if (profilePhoto && !contact.profile?.image?.src) {
    profilePhoto.replaceChildren(document.createTextNode((contact.profile?.name || "L").trim().charAt(0)));
    profilePhoto.setAttribute("aria-hidden", "true");
  } else if (profilePhoto && contact.profile?.image?.src) {
    const img = createElement("img");
    img.src = normalizeImagePath(contact.profile.image.src);
    img.alt = contact.profile.image.alt || contact.profile.name || "Profilová fotografie";
    img.loading = "lazy";
    img.decoding = "async";
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
  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (form.dataset.ready !== "true" || !isFormAccessKey(form.querySelector('[name="access_key"]')?.value)) {
      setFormStatus(form, form.dataset.unavailableMessage, "error");
      return;
    }

    submitting = true;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    form.setAttribute("aria-busy", "true");
    setFormStatus(form, form.dataset.pendingMessage, "info");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(web3FormsEndpoint, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Submission not accepted");

      form.reset();
      setFormStatus(form, form.dataset.successMessage, "success");
    } catch (error) {
      // A timeout does not prove rejection; avoid inviting an immediate duplicate.
      const message = error.name === "AbortError"
        ? "Nepodařilo se potvrdit odeslání. Zpráva mohla dorazit; před opakováním prosím chvíli vyčkejte nebo zavolejte."
        : form.dataset.errorMessage;
      setFormStatus(form, message, "error");
    } finally {
      clearTimeout(timeout);
      submitting = false;
      form.removeAttribute("aria-busy");
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
  renderTestimonials(content.testimonials?.items, content.testimonials?.display);
  renderFaq(content.faq?.items);
  applyContact(content.contact);
  renderLegalBlocks(content.legal?.blocks);
  window.BemerSeo?.apply(content);
};

const loadCmsContent = async () => {
  try {
    const response = await fetch("./content/site.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`CMS content failed: ${response.status}`);
    const content = await response.json();
    applyCmsContent(content);
  } catch (error) {
    console.warn("CMS content could not be loaded; using HTML fallback.", error);
    const form = document.querySelector("[data-contact-form]");
    if (form) setFormStatus(form, "Formulář se nepodařilo načíst. Obnovte stránku nebo využijte uvedený e-mail či telefon.", "error");
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
    }, 42000);
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
