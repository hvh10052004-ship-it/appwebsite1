const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const siteHeader = document.getElementById("siteHeader");
const contactForm = document.getElementById("contactForm");
const searchForm = document.getElementById("searchForm");
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "webstudio-theme";

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"
    );
  }
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      document.querySelectorAll(".has-dropdown.open").forEach((el) => {
        el.classList.remove("open");
        const btn = el.querySelector("[aria-expanded]");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    });
  });
}

function isMobileNav() {
  return window.matchMedia("(max-width: 900px)").matches;
}

document.querySelectorAll(".has-dropdown").forEach((item) => {
  const btn = item.querySelector(".nav-drop-btn, .nav-more");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    if (!isMobileNav()) return;
    e.stopPropagation();
    const willOpen = !item.classList.contains("open");
    document.querySelectorAll(".has-dropdown.open").forEach((el) => {
      if (el !== item) {
        el.classList.remove("open");
        const other = el.querySelector("[aria-expanded]");
        if (other) other.setAttribute("aria-expanded", "false");
      }
    });
    item.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });
});

document.addEventListener("click", () => {
  if (!isMobileNav()) return;
  document.querySelectorAll(".has-dropdown.open").forEach((el) => {
    el.classList.remove("open");
    const btn = el.querySelector("[aria-expanded]");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
});

if (siteHeader) {
  window.addEventListener(
    "scroll",
    () => {
      siteHeader.classList.toggle("scrolled", window.scrollY > 50);
    },
    { passive: true }
  );
}

if (themeToggle) {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" ? "light" : "dark");

  themeToggle.addEventListener("click", async (event) => {
    const next = document.body.classList.contains("theme-light")
      ? "dark"
      : "light";

    const rect = themeToggle.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty("--theme-ripple-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-ripple-y", `${y}px`);
    document.documentElement.style.setProperty(
      "--theme-ripple-r",
      `${Math.ceil(endRadius)}px`
    );

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      applyTheme(next);
      return;
    }

    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        applyTheme(next);
      });
      try {
        await transition.ready;
      } catch (_) {
        /* ignore aborted transition */
      }
      return;
    }

    // Fallback: vòng nước lan tỏa bằng overlay
    const overlay = document.createElement("div");
    overlay.className = "theme-ripple-overlay";
    overlay.style.setProperty("--theme-ripple-x", `${x}px`);
    overlay.style.setProperty("--theme-ripple-y", `${y}px`);
    overlay.dataset.theme = next;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("is-active");
    });

    window.setTimeout(() => {
      applyTheme(next);
      overlay.classList.add("is-done");
      window.setTimeout(() => overlay.remove(), 280);
    }, 420);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Cảm ơn bạn! Yêu cầu của bạn đã được gửi.");
    this.reset();
  });
}

if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const q = new FormData(this).get("q");
    const result = document.getElementById("searchResult");
    if (result) {
      result.textContent = q
        ? `Đã tìm: "${q}" — hiển thị các dự án / dịch vụ liên quan.`
        : "Vui lòng nhập từ khóa.";
    }
  });
}

/* ===== SEARCH OVERLAY ===== */
const searchOpenBtn = document.getElementById("searchOpen");
const featuredServices = [
  {
    title: "Thiết kế Website",
    href: "product.html",
  },
  {
    title: "Thiết kế Landing Page",
    href: "landing.html",
  },
  {
    title: "Thiết kế Website công ty",
    href: "company.html",
  },
  {
    title: "Thiết kế Website Startup / SaaS",
    href: "saas.html",
  },
  {
    title: "Thiết kế Web bán hàng / E-commerce",
    href: "ecommerce.html",
  },
];

const searchIconSvg =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
const closeIconSvg =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
const checkSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"></path></svg>';

function ensureSearchOverlay() {
  if (document.getElementById("searchPanel")) return;

  const backdrop = document.createElement("div");
  backdrop.className = "search-backdrop";
  backdrop.id = "searchBackdrop";

  const panel = document.createElement("div");
  panel.className = "search-panel";
  panel.id = "searchPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Tìm kiếm");

  panel.innerHTML = `
    <div class="search-field">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
      <input id="searchOverlayInput" type="search" placeholder="Tìm kiếm..." autocomplete="off" />
    </div>
    <div class="search-featured">
      <h3>Dịch vụ nổi bật</h3>
      <ul id="searchFeaturedList">
        ${featuredServices
          .map(
            (item) => `
          <li data-title="${item.title.toLowerCase()}">
            <a href="${item.href}">
              <span class="search-check">${checkSvg}</span>
              <span>${item.title}</span>
            </a>
          </li>`
          )
          .join("")}
      </ul>
      <p class="search-empty" id="searchEmpty">Không tìm thấy dịch vụ phù hợp.</p>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
}

function setSearchButtonMode(isOpen) {
  if (!searchOpenBtn) return;
  searchOpenBtn.classList.toggle("is-close", isOpen);
  searchOpenBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  searchOpenBtn.setAttribute("aria-label", isOpen ? "Đóng tìm kiếm" : "Tìm kiếm");
  searchOpenBtn.innerHTML = isOpen ? closeIconSvg : searchIconSvg;
}

function openSearchOverlay() {
  ensureSearchOverlay();
  document.body.classList.add("search-open");
  setSearchButtonMode(true);
  const input = document.getElementById("searchOverlayInput");
  if (input) {
    input.value = "";
    filterFeatured("");
    window.setTimeout(() => input.focus(), 50);
  }
}

function closeSearchOverlay() {
  document.body.classList.remove("search-open");
  setSearchButtonMode(false);
}

function filterFeatured(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll("#searchFeaturedList li");
  let visible = 0;
  items.forEach((li) => {
    const match = !q || (li.dataset.title || "").includes(q);
    li.classList.toggle("is-hidden", !match);
    if (match) visible += 1;
  });
  const empty = document.getElementById("searchEmpty");
  if (empty) empty.classList.toggle("is-visible", visible === 0);
}

if (searchOpenBtn) {
  ensureSearchOverlay();

  searchOpenBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (document.body.classList.contains("search-open")) {
      closeSearchOverlay();
    } else {
      openSearchOverlay();
    }
  });

  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("search-open")) return;
    const panel = document.getElementById("searchPanel");
    const backdrop = document.getElementById("searchBackdrop");
    if (e.target === backdrop) {
      closeSearchOverlay();
      return;
    }
    if (
      panel &&
      !panel.contains(e.target) &&
      !searchOpenBtn.contains(e.target)
    ) {
      closeSearchOverlay();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("search-open")) {
      closeSearchOverlay();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "searchOverlayInput") {
      filterFeatured(e.target.value);
    }
  });
}

/* Floating contact bubbles */
(function initFloatBubbles() {
  if (document.getElementById("floatBubbles")) return;

  const phone = "0938002776";
  const wrap = document.createElement("div");
  wrap.className = "float-bubbles";
  wrap.id = "floatBubbles";
  wrap.innerHTML = `
    <a class="float-btn float-btn--zalo" href="https://zalo.me/${phone}" target="_blank" rel="noopener noreferrer" aria-label="Chat Zalo">Zalo</a>
    <a class="float-btn float-btn--phone" href="tel:${phone}" aria-label="Gọi điện thoại">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"/></svg>
    </a>
    <button type="button" class="float-btn float-btn--top" id="floatScrollTop" aria-label="Cuộn lên đầu trang">
      <svg class="float-progress" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="float-progress-track" cx="26" cy="26" r="23"></circle>
        <circle class="float-progress-bar" cx="26" cy="26" r="23"></circle>
      </svg>
      <span class="float-top-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg>
      </span>
    </button>
  `;
  document.body.appendChild(wrap);

  const topBtn = document.getElementById("floatScrollTop");
  const progressBar = wrap.querySelector(".float-progress-bar");
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  if (progressBar) {
    progressBar.style.strokeDasharray = `${circumference}`;
    progressBar.style.strokeDashoffset = `${circumference}`;
  }

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (topBtn) {
      topBtn.classList.toggle("is-visible", scrollTop > 280);
    }
    if (progressBar) {
      progressBar.style.strokeDashoffset = `${circumference * (1 - progress)}`;
    }
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
