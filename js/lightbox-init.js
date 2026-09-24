/**
 * lightbox-init.js
 * Initializes GLightbox for gallery image lightbox functionality.
 * Loads GLightbox CSS and JS from CDN, then activates on gallery links.
 */

(function () {
  "use strict";

  const GLIGHTBOX_CSS = "https://cdn.jsdelivr.net/npm/glightbox@3.2.0/dist/css/glightbox.min.css";
  const GLIGHTBOX_JS = "https://cdn.jsdelivr.net/npm/glightbox@3.2.0/dist/js/glightbox.min.js";

  function injectStylesheet(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function injectScript(src, onload) {
    if (document.querySelector('script[src="' + src + '"]')) {
      if (typeof window.GLightbox === "function") {
        onload();
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = onload;
    document.head.appendChild(script);
  }

  function initLightbox() {
    if (typeof window.GLightbox !== "function") {
      console.warn("[lightbox-init] GLightbox not available; skipping initialization.");
      return;
    }

    const lightbox = GLightbox({
      selector: ".gallery-item, .lightbox-trigger",
      touchNavigation: true,
      loop: true,
      width: "90%",
      height: "90%",
      skin: "dark",
      autoplayVideos: true,
      videoAutoplay: true,
      videoRatio: "16:9",
      openEffect: "zoom",
      closeEffect: "zoom",
      slideEffect: "slide",
      slideClass: "",
      background: "#0D0D0D",
      backgroundMultiplier: "0.95",
      loader: true,
      loaderText: "Loading...",
      description: true,
      descriptionPosition: "bottom",
      caption: true,
      captionPosition: "bottom",
      counter: true,
      counterPosition: "top",
      navigation: true,
      navigationIcons: true,
      navigationPosition: "bottom",
      fullscreen: true,
      fullscreenIcon: true,
      download: false,
      share: false,
      zoom: true,
      zoomIcon: true,
      drag: true,
      keyboard: true,
      keyboardKeys: {
        next: [39],
        prev: [37],
        close: [27]
      },
      onOpen: function () {
        document.body.style.overflow = "hidden";
        document.body.classList.add("lightbox-open");
      },
      onClose: function () {
        document.body.style.overflow = "";
        document.body.classList.remove("lightbox-open");
      },
      onSlideChange: function (slide) {
        const currentSlide = slide.current;
        const totalSlides = slide.total;
        const counterEl = document.querySelector(".glightbox-slide-counter");
        if (counterEl) {
          counterEl.textContent = currentSlide + " / " + totalSlides;
        }
      }
    });

    window.__glightboxInstance = lightbox;

    // Re-scan DOM for dynamically added gallery items
    window.addEventListener("gallery:updated", function () {
      lightbox.reScan();
    });

    // Handle keyboard escape when lightbox is open
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("lightbox-open")) {
        lightbox.close();
      }
    });

    // Prevent body scroll when lightbox is open
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          const isOpen = document.body.classList.contains("lightbox-open");
          document.body.style.overflow = isOpen ? "hidden" : "";
        }
      });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    console.log("[lightbox-init] GLightbox initialized successfully.");
  }

  // Inject CSS immediately
  injectStylesheet(GLIGHTBOX_CSS);

  // Inject JS and initialize on load
  injectScript(GLIGHTBOX_JS, initLightbox);

  // Fallback: if GLightbox is already loaded (e.g., preloaded), init now
  if (typeof window.GLightbox === "function") {
    initLightbox();
  }
})();
