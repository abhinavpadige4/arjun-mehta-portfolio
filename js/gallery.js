import { initLightbox } from './lightbox-init.js';

const GALLERY_ENDPOINT = 'data/images.json';
const GALLERY_CONTAINER_ID = 'gallery-grid';
const FILTER_CONTAINER_ID = 'gallery-filters';

const CATEGORY_ORDER = ['All', 'Birds', 'Mammals', 'Reptiles', 'Amphibians', 'Marine', 'Insects'];

let allImages = [];
let activeFilter = 'All';

async function fetchImageMetadata() {
  try {
    const response = await fetch(GALLERY_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of image items');
    }
    return data;
  } catch (error) {
    console.error('[Gallery] Failed to fetch image metadata:', error.message);
    renderErrorState(error.message);
    return [];
  }
}

function renderErrorState(message) {
  const container = document.getElementById(GALLERY_CONTAINER_ID);
  if (!container) return;
  container.innerHTML = `
    <div class="gallery-error flex flex-col items-center justify-center py-20 px-6 text-center">
      <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="text-xl font-semibold text-white mb-2">Gallery Unavailable</h3>
      <p class="text-gray-400 max-w-md">${escapeHtml(message)}. Please check back later or contact the photographer directly.</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function buildFilterCategories(images) {
  const categories = new Set();
  images.forEach(img => {
    if (img.category) categories.add(img.category);
  });
  const ordered = CATEGORY_ORDER.filter(c => c === 'All' || categories.has(c));
  categories.forEach(c => {
    if (!ordered.includes(c)) ordered.push(c);
  });
  return ordered;
}

function renderFilterButtons(categories) {
  const container = document.getElementById(FILTER_CONTAINER_ID);
  if (!container) return;
  container.innerHTML = '';
  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `gallery-filter-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
      category === activeFilter
        ? 'bg-[#FF6B6B] text-white border-[#FF6B6B]'
        : 'bg-transparent text-gray-300 border-gray-600 hover:border-[#FF6B6B] hover:text-white'
    }`;
    button.textContent = category;
    button.setAttribute('aria-pressed', category === activeFilter ? 'true' : 'false');
    button.addEventListener('click', () => {
      activeFilter = category;
      renderFilterButtons(categories);
      renderGallery();
    });
    container.appendChild(button);
  });
}

function createGalleryItem(image) {
  const article = document.createElement('article');
  article.className = 'gallery-item group relative overflow-hidden rounded-lg cursor-pointer bg-gray-900';
  article.setAttribute('data-category', image.category || 'Uncategorized');

  const img = document.createElement('img');
  img.src = image.src;
  img.alt = image.alt || `Wildlife photograph by Arjun Mehta`;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110';
  img.setAttribute('data-lightbox', 'gallery');
  img.setAttribute('data-title', image.title || '');
  img.setAttribute('data-description', image.alt || '');

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4';

  const titleEl = document.createElement('h3');
  titleEl.className = 'text-white font-semibold text-lg mb-1';
  titleEl.textContent = image.title || 'Untitled';

  const categoryEl = document.createElement('span');
  categoryEl.className = 'text-[#FF6B6B] text-sm font-medium uppercase tracking-wider';
  categoryEl.textContent = image.category || 'Wildlife';

  overlay.appendChild(titleEl);
  overlay.appendChild(categoryEl);
  article.appendChild(img);
  article.appendChild(overlay);

  return article;
}

function renderGallery() {
  const container = document.getElementById(GALLERY_CONTAINER_ID);
  if (!container) return;

  const filtered = activeFilter === 'All'
    ? allImages
    : allImages.filter(img => img.category === activeFilter);

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <p class="text-gray-400 text-lg">No photographs in this category yet.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(image => {
    fragment.appendChild(createGalleryItem(image));
  });
  container.appendChild(fragment);

  initLightbox();
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px', threshold: 0.01 });

  document.querySelectorAll('.gallery-item img[data-src]').forEach(img => {
    observer.observe(img);
  });
}

async function initGallery() {
  allImages = await fetchImageMetadata();
  if (allImages.length === 0) return;

  const categories = buildFilterCategories(allImages);
  renderFilterButtons(categories);
  renderGallery();
  setupIntersectionObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}
