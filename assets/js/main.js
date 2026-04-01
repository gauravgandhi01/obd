const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const submenuOwner = document.querySelector(".has-submenu");
const submenuToggle = document.querySelector(".submenu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const yearEl = document.querySelector("#year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("open");

    if (expanded && submenuOwner) {
      submenuOwner.classList.remove("submenu-open");
      if (submenuToggle) {
        submenuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

if (submenuToggle && submenuOwner) {
  submenuToggle.addEventListener("click", () => {
    const isOpen = submenuOwner.classList.toggle("submenu-open");
    submenuToggle.setAttribute("aria-expanded", String(isOpen));
    submenuToggle.textContent = isOpen ? "-" : "+";
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 780 && siteNav && menuToggle) {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      if (submenuOwner && submenuToggle) {
        submenuOwner.classList.remove("submenu-open");
        submenuToggle.setAttribute("aria-expanded", "false");
        submenuToggle.textContent = "+";
      }
    }
  });
});

const sections = [...document.querySelectorAll("main section[id]")];

if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const targetId = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${targetId}` || (targetId === "before-after" && href === "#projects") || (targetId === "donation-partners" && href === "#projects")) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
}

const galleryImages = document.querySelectorAll(
  ".real-project-grid .project-card img, .stage-shot img"
);

galleryImages.forEach((img) => {
  const setOrientationClass = () => {
    const stageShot = img.closest(".stage-shot");
    if (img.naturalHeight > img.naturalWidth) {
      img.classList.add("is-portrait");
      if (stageShot) {
        stageShot.classList.add("is-portrait-frame");
      }
    } else {
      img.classList.remove("is-portrait");
      if (stageShot) {
        stageShot.classList.remove("is-portrait-frame");
      }
    }
  };

  if (img.complete) {
    setOrientationClass();
  } else {
    img.addEventListener("load", setOrientationClass, { once: true });
  }
});

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

    const projectCard = img.closest(".real-project-grid .project-card");
    if (projectCard) {
      return [...projectCard.querySelectorAll("img")];
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

  const openLightbox = (img) => {
    activeImage = img;
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
