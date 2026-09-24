const App = (() => {
  'use strict';

  const config = {
    menuSelector: '.header__nav-toggle',
    navSelector: '.header__nav',
    navLinksSelector: '.header__nav-link',
    formSelector: '.contact__form',
    formInputSelector: '.contact__form-input',
    formErrorSelector: '.contact__form-error',
    formSuccessSelector: '.contact__form-success',
    scrollThreshold: 80,
    headerSelector: '.header',
    gallerySelector: '.gallery__grid',
    galleryItemSelector: '.gallery__item',
    lightboxSelector: '.lightbox',
    lightboxCloseSelector: '.lightbox__close',
    lightboxPrevSelector: '.lightbox__prev',
    lightboxNextSelector: '.lightbox__next',
    lightboxImageSelector: '.lightbox__image',
    lightboxCaptionSelector: '.lightbox__caption',
    lightboxCounterSelector: '.lightbox__counter',
    footerYearSelector: '.footer__year'
  };

  const state = {
    menuOpen: false,
    currentLightboxIndex: 0,
    galleryImages: [],
    isSubmitting: false
  };

  const MobileMenu = {
    init() {
      const toggle = document.querySelector(config.menuSelector);
      const nav = document.querySelector(config.navSelector);
      if (!toggle || !nav) return;

      toggle.addEventListener('click', () => this.toggle());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.menuOpen) this.close();
      });

      document.addEventListener('click', (e) => {
        if (state.menuOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
          this.close();
        }
      });

      const links = document.querySelectorAll(config.navLinksSelector);
      links.forEach(link => {
        link.addEventListener('click', () => this.close());
      });
    },

    toggle() {
      state.menuOpen ? this.close() : this.open();
    },

    open() {
      const toggle = document.querySelector(config.menuSelector);
      const nav = document.querySelector(config.navSelector);
      if (!toggle || !nav) return;

      nav.classList.add('header__nav--open');
      toggle.classList.add('header__nav-toggle--active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.style.overflow = 'hidden';
      state.menuOpen = true;
    },

    close() {
      const toggle = document.querySelector(config.menuSelector);
      const nav = document.querySelector(config.navSelector);
      if (!toggle || !nav) return;

      nav.classList.remove('header__nav--open');
      toggle.classList.remove('header__nav-toggle--active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
      state.menuOpen = false;
    }
  };

  const HeaderScroll = {
    init() {
      const header = document.querySelector(config.headerSelector);
      if (!header) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.update();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      this.update();
    },

    update() {
      const header = document.querySelector(config.headerSelector);
      if (!header) return;

      if (window.scrollY > config.scrollThreshold) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }
  };

  const FormValidator = {
    init() {
      const form = document.querySelector(config.formSelector);
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });

      const inputs = form.querySelectorAll(config.formInputSelector);
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    },

    handleSubmit(form) {
      const inputs = form.querySelectorAll(config.formInputSelector);
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        const firstError = form.querySelector('.contact__form-input--error');
        if (firstError) firstError.focus();
        return;
      }

      if (state.isSubmitting) return;
      state.isSubmitting = true;

      const submitBtn = form.querySelector('.contact__form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      this.sendForm(data, form);
    },

    sendForm(data, form) {
      const successMsg = document.querySelector(config.formSuccessSelector);
      const submitBtn = form.querySelector('.contact__form-submit');

      setTimeout(() => {
        form.reset();
        state.isSubmitting = false;

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }

        if (successMsg) {
          successMsg.classList.add('contact__form-success--visible');
          successMsg.setAttribute('aria-live', 'polite');
          setTimeout(() => {
            successMsg.classList.remove('contact__form-success--visible');
          }, 5000);
        }
      }, 1500);
    },

    validateField(input) {
      const value = input.value.trim();
      const type = input.getAttribute('type') || input.tagName.toLowerCase();
      const required = input.hasAttribute('required');
      const errorEl = input.closest('.contact__form-group')?.querySelector(config.formErrorSelector);

      let error = '';

      if (required && !value) {
        error = 'This field is required.';
      } else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address.';
        }
      } else if (type === 'tel' && value) {
        const telRegex = /^[+]?[\d\s\-().]{7,20}$/;
        if (!telRegex.test(value)) {
          error = 'Please enter a valid phone number.';
        }
      } else if (input.getAttribute('name') === 'message' && value) {
        if (value.length < 10) {
          error = 'Message must be at least 10 characters.';
        }
      } else if (input.getAttribute('name') === 'name' && value) {
        if (value.length < 2) {
          error = 'Name must be at least 2 characters.';
        }
      }

      if (error) {
        this.showFieldError(input, errorEl, error);
        return false;
      }

      this.clearFieldError(input);
      if (errorEl) errorEl.textContent = '';
      return true;
    },

    showFieldError(input, errorEl, message) {
      input.classList.add('contact__form-input--error');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', input.id + '-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.setAttribute('role', 'alert');
      }
    },

    clearFieldError(input) {
      input.classList.remove('contact__form-input--error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  };

  const GalleryInit = {
    init() {
      const grid = document.querySelector(config.gallerySelector);
      if (!grid) return;

      const items = grid.querySelectorAll(config.galleryItemSelector);
      state.galleryImages = [];

      items.forEach((item, index) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery__caption');
        if (img) {
          state.galleryImages.push({
            src: img.getAttribute('data-full') || img.src,
            alt: img.alt || '',
            caption: caption ? caption.textContent : ''
          });
        }

        item.addEventListener('click', () => {
          Lightbox.open(index);
        });

        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'View image: ' + (img ? img.alt : 'Gallery image ' + (index + 1)));

        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            Lightbox.open(index);
          }
        });
      });
    }
  };

  const Lightbox = {
    init() {
      const lightbox = document.querySelector(config.lightboxSelector);
      if (!lightbox) return;

      const closeBtn = document.querySelector(config.lightboxCloseSelector);
      const prevBtn = document.querySelector(config.lightboxPrevSelector);
      const nextBtn = document.querySelector(config.lightboxNextSelector);

      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
      if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
      if (nextBtn) nextBtn.addEventListener('click', () => this.next());

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('lightbox--active')) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    },

    open(index) {
      const lightbox = document.querySelector(config.lightboxSelector);
      if (!lightbox || state.galleryImages.length === 0) return;

      state.currentLightboxIndex = index;
      this.updateImage();
      lightbox.classList.add('lightbox--active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const closeBtn = document.querySelector(config.lightboxCloseSelector);
      if (closeBtn) closeBtn.focus();
    },

    close() {
      const lightbox = document.querySelector(config.lightboxSelector);
      if (!lightbox) return;

      lightbox.classList.remove('lightbox--active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      const grid = document.querySelector(config.gallerySelector);
      if (grid) {
        const items = grid.querySelectorAll(config.galleryItemSelector);
        if (items[state.currentLightboxIndex]) {
          items[state.currentLightboxIndex].focus();
        }
      }
    },

    prev() {
      if (state.galleryImages.length === 0) return;
      state.currentLightboxIndex = (state.currentLightboxIndex - 1 + state.galleryImages.length) % state.galleryImages.length;
      this.updateImage();
    },

    next() {
      if (state.galleryImages.length === 0) return;
      state.currentLightboxIndex = (state.currentLightboxIndex + 1) % state.galleryImages.length;
      this.updateImage();
    },

    updateImage() {
      const img = state.galleryImages[state.currentLightboxIndex];
      if (!img) return;

      const lightboxImg = document.querySelector(config.lightboxImageSelector);
      const captionEl = document.querySelector(config.lightboxCaptionSelector);
      const counterEl = document.querySelector(config.lightboxCounterSelector);

      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
      if (captionEl) captionEl.textContent = img.caption;
      if (counterEl) counterEl.textContent = (state.currentLightboxIndex + 1) + ' / ' + state.galleryImages.length;
    }
  };

  const FooterYear = {
    init() {
      const el = document.querySelector(config.footerYearSelector);
      if (el) el.textContent = new Date().getFullYear();
    }
  };

  const LazyLoad = {
    init() {
      const lazyImages = document.querySelectorAll('img[data-src]');
      if (!lazyImages.length) return;

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.getAttribute('data-src');
              if (img.getAttribute('data-srcset')) {
                img.srcset = img.getAttribute('data-srcset');
              }
              img.removeAttribute('data-src');
              img.removeAttribute('data-srcset');
              img.classList.add('lazy-loaded');
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '200px', threshold: 0.01 });

        lazyImages.forEach(img => observer.observe(img));
      } else {
        lazyImages.forEach(img => {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        });
      }
    }
  };

  const SmoothScroll = {
    init() {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          if (targetId === '#') return;
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };

  const init = () => {
    MobileMenu.init();
    HeaderScroll.init();
    FormValidator.init();
    GalleryInit.init();
    Lightbox.init();
    FooterYear.init();
    LazyLoad.init();
    SmoothScroll.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
