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
