/**
 * gallery.js
 * Fetches image metadata from data/images.json and renders
 * a responsive gallery grid with lazy-loaded images.
 */

const GALLERY_CONTAINER_ID = 'gallery-grid';
const DATA_PATH = 'data/images.json';
const PLACEHOLDER_SRC = 'assets/images/placeholder.jpg';

/**
 * Fetch image metadata from the JSON data file.
 * @returns {Promise<Array>} Array of ImageItem objects.
 */
async function fetchImageData() {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${DATA_PATH}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of ImageItem objects.');
    }
    return data;
  } catch (err) {
    console.error('[gallery.js] Failed to load image data:', err.message);
    return [];
  }
}

/**
 * Create a single gallery item DOM element.
 * @param {Object} item - ImageItem object with src, alt, title, category.
 * @returns {HTMLElement} The gallery item element.
 */
function createGalleryItem(item) {
  const article = document.createElement('article');
  article.className =
    'gallery-item group relative overflow-hidden rounded-lg bg-neutral-900 cursor-pointer transition-transform duration-300 hover:scale-[1.02]';
  article.setAttribute('data-category', item.category || '');
  article.setAttribute('data-title', item.title || '');

  const img = document.createElement('img');
  img.src = item.src || PLACEHOLDER_SRC;
  img.alt = item.alt || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.className =
    'w-full h-full object-cover transition-opacity duration-500 opacity-0';
  img.addEventListener('load', () => {
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  });
  img.addEventListener('error', () => {
    img.src = PLACEHOLDER_SRC;
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  });

  const overlay = document.createElement('div');
  overlay.className =
    'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4';

  const caption = document.createElement('div');
  caption.className = 'text-white';

  if (item.title) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-lg font-semibold leading-tight';
    titleEl.textContent = item.title;
    caption.appendChild(titleEl);
  }

  if (item.category) {
    const catEl = document.createElement('span');
    catEl.className = 'text-sm text-neutral-300 mt-1 block';
    catEl.textContent = item.category;
    caption.appendChild(catEl);
  }

  overlay.appendChild(caption);
  article.appendChild(img);
  article.appendChild(overlay);

  return article;
}

/**
 * Render the full gallery into the target container.
 * @param {Array} images - Array of ImageItem objects.
 */
function renderGallery(images) {
  const container = document.getElementById(GALLERY_CONTAINER_ID);
  if (!container) {
    console.error(
      `[gallery.js] Gallery container #${GALLERY_CONTAINER_ID} not found.`
    );
    return;
  }

  container.innerHTML = '';

  if (images.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-center text-neutral-400 py-12 col-span-full';
    empty.textContent = 'No photographs available at this time.';
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  images.forEach((item) => {
    fragment.appendChild(createGalleryItem(item));
  });
  container.appendChild(fragment);
}

/**
 * Initialize the gallery: fetch data and render.
 */
async function initGallery() {
  const images = await fetchImageData();
  renderGallery(images);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}
