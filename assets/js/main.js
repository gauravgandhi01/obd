const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const tabLinks = [...document.querySelectorAll(".tab-link[data-tab]")];
const tabSections = [...document.querySelectorAll(".tab-section[data-tab-panel]")];
const yearEl = document.querySelector("#year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const validTabs = new Set(tabSections.map((section) => section.dataset.tabPanel));

const closeMobileNav = () => {
  if (window.innerWidth <= 1200 && siteNav && menuToggle) {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation menu" : "Close navigation menu");
    siteNav.classList.toggle("open", !expanded);
  });
}

const setActiveTab = (tabName, updateHash = true) => {
  const targetTab = tabName === "projects" ? "before-after" : tabName;
  const safeTab = validTabs.has(targetTab) ? targetTab : "home";

  tabSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.tabPanel === safeTab);
  });

  tabLinks.forEach((link) => {
    if (link.dataset.tab === safeTab) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (updateHash) {
    history.replaceState(null, "", `#${safeTab}`);
  }

  closeMobileNav();
  window.scrollTo({ top: 0, behavior: "auto" });
};

tabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveTab(link.dataset.tab);
  });
});

const initialHash = window.location.hash.slice(1);
setActiveTab(initialHash, initialHash === "projects");
window.addEventListener("hashchange", () => {
  setActiveTab(window.location.hash.slice(1), false);
});

document.querySelectorAll("[data-comparison]").forEach((comparison) => {
  const before = comparison.querySelector('[data-stage="before"]');
  const midway = comparison.querySelector('[data-stage="midway"]');
  const after = comparison.querySelector('[data-stage="after"]');
  if (!before || !after) {
    return;
  }

  const frame = document.createElement("div");
  frame.className = "comparison-frame";

  const stages = midway ? ["before", "midway", "after"] : ["before", "after"];
  frame.append(before);
  if (midway) {
    frame.append(midway);
  }
  frame.append(after);

  if (midway) {
    comparison.classList.add("photo-comparison-three-stage");
  }

  const range = document.createElement("input");
  range.type = "range";
  range.className = "comparison-range";
  range.min = "0";
  range.max = "100";
  range.step = "1";
  range.value = "50";
  const description = midway ? "before, midway, and after comparison" : "before and after comparison";
  range.setAttribute("aria-label", `${comparison.dataset.comparison}: ${description}`);

  const divider = document.createElement("span");
  divider.className = "comparison-divider";
  divider.setAttribute("aria-hidden", "true");
  const handle = document.createElement("span");
  handle.className = "comparison-handle";
  handle.textContent = "‹ ›";
  divider.append(handle);
  frame.append(range, divider);

  const updateComparison = () => {
    const value = Number(range.value);
    frame.style.setProperty("--comparison-position", `${value}%`);
    if (midway) {
      // Scrub through the three complete photos with a single continuous handle.
      frame.style.setProperty("--comparison-midway-opacity", Math.min(value / 50, 1));
      frame.style.setProperty("--comparison-after-opacity", Math.max((value - 50) / 50, 0));
      const progress = value <= 50 ? value * 2 : (value - 50) * 2;
      const from = value <= 50 ? "Before" : "Midway";
      const to = value <= 50 ? "Midway" : "After";
      range.setAttribute("aria-valuetext", `${from} ${100 - progress}%, ${to} ${progress}%`);
    } else {
      range.setAttribute("aria-valuetext", `${value}% before, ${100 - value}% after`);
    }
  };
  range.addEventListener("input", updateComparison);
  updateComparison();
  const actions = document.createElement("div");
  actions.className = "comparison-actions";

  stages.forEach((stage) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "comparison-label comparison-view";
    button.dataset.viewStage = stage;
    button.textContent = stage[0].toUpperCase() + stage.slice(1);
    button.setAttribute("aria-label", `${comparison.dataset.comparison}: view full ${stage} photo`);
    actions.append(button);
  });
  frame.append(actions);

  comparison.append(frame);
  comparison.classList.add("is-ready");
});

const galleryImages = [...document.querySelectorAll(".showcase-card .stage-shot img")];

if (galleryImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const lightboxPanel = document.createElement("div");
  lightboxPanel.className = "lightbox-panel";
  lightboxPanel.setAttribute("role", "dialog");
  lightboxPanel.setAttribute("aria-modal", "true");
  lightboxPanel.setAttribute("aria-label", "Expanded image view");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "lightbox-close";
  closeBtn.setAttribute("aria-label", "Close expanded image");
  closeBtn.textContent = "×";

  const mediaWrap = document.createElement("div");
  mediaWrap.className = "lightbox-media";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "lightbox-nav lightbox-prev";
  prevBtn.setAttribute("aria-label", "View previous photo");
  prevBtn.textContent = "‹";

  const lightboxImage = document.createElement("img");
  lightboxImage.className = "lightbox-image";
  lightboxImage.alt = "";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "lightbox-nav lightbox-next";
  nextBtn.setAttribute("aria-label", "View next photo");
  nextBtn.textContent = "›";

  const lightboxCaption = document.createElement("p");
  lightboxCaption.className = "lightbox-caption";

  mediaWrap.append(prevBtn, lightboxImage, nextBtn);
  lightboxPanel.append(closeBtn, mediaWrap, lightboxCaption);
  lightbox.append(lightboxPanel);
  document.body.append(lightbox);

  let activeImage = null;
  let activeGroup = [];
  let activeIndex = 0;

  const getImageGroup = (img) => {
    const showcaseCard = img.closest(".showcase-card");
    if (showcaseCard) {
      return [...showcaseCard.querySelectorAll(".stage-shot img")];
    }

    return [img];
  };

  const renderLightboxImage = () => {
    if (!activeGroup.length) {
      return;
    }

    const currentImg = activeGroup[activeIndex];
    const imgSrc = currentImg.currentSrc || currentImg.src;
    const imgAlt = currentImg.alt || "Expanded project image";

    lightboxImage.src = imgSrc;
    lightboxImage.alt = imgAlt;
    lightboxImage.dataset.stage = currentImg.closest(".stage-shot").dataset.stage;

    if (activeGroup.length > 1) {
      lightboxCaption.textContent = `${imgAlt} (${activeIndex + 1}/${activeGroup.length})`;
    } else {
      lightboxCaption.textContent = imgAlt;
    }

    const hasMultiple = activeGroup.length > 1;
    prevBtn.hidden = !hasMultiple;
    nextBtn.hidden = !hasMultiple;
  };

  const stepImage = (delta) => {
    if (activeGroup.length <= 1) {
      return;
    }

    activeIndex = (activeIndex + delta + activeGroup.length) % activeGroup.length;
    renderLightboxImage();
  };

  const openLightbox = (img, trigger = img) => {
    activeImage = trigger;
    activeGroup = getImageGroup(img);
    activeIndex = Math.max(activeGroup.indexOf(img), 0);
    renderLightboxImage();

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    delete lightboxImage.dataset.stage;
    lightboxCaption.textContent = "";
    activeGroup = [];
    activeIndex = 0;
    prevBtn.hidden = true;
    nextBtn.hidden = true;

    if (activeImage) {
      activeImage.focus();
      activeImage = null;
    }
  };

  galleryImages.forEach((img) => {
    if (img.closest(".photo-comparison.is-ready")) {
      return;
    }

    img.classList.add("expandable-image");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Expand image: ${img.alt || "Project image"}`);

    img.addEventListener("click", () => openLightbox(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  document.querySelectorAll(".comparison-view").forEach((button) => {
    button.addEventListener("click", () => {
      const comparison = button.closest(".photo-comparison");
      const img = comparison.querySelector(`[data-stage="${button.dataset.viewStage}"] img`);
      openLightbox(img, button);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => stepImage(-1));
  nextBtn.addEventListener("click", () => stepImage(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowRight") {
      stepImage(1);
    } else if (event.key === "ArrowLeft") {
      stepImage(-1);
    }
  });
}
