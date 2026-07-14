/**
 * flipbook.js
 * Dynamic CMS-driven flipbook component for Noblessa USA.
 *
 * Reads page data injected by the Eleventy template (via #flipbook-data),
 * auto-detects single-page vs double-spread images by measuring their
 * natural pixel dimensions, and renders a page-turn flipbook using
 * StPageFlip (https://github.com/Nodlik/StPageFlip).
 *
 * Single page  = 2550 × 3300 px  → one page
 * Double spread = 5100 × 3300 px  → two pages (left half + right half)
 */

import { PageFlip } from 'page-flip';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Expected width (px) for a single catalog page. */
const SINGLE_WIDTH = 2550;

/** Expected width (px) for a double-page spread. */
const DOUBLE_WIDTH = 5100;

/** Pixel tolerance when classifying image type. */
const TOLERANCE = 250;

/**
 * Aspect ratio of a single page: 2550 / 3300 ≈ 0.7727
 * PageFlip display dimensions (matching this ratio):
 *   width  = 560 px
 *   height = 560 / (2550/3300) = 560 × (3300/2550) ≈ 725 px
 */
const DISPLAY_WIDTH  = 560;
const DISPLAY_HEIGHT = Math.round(DISPLAY_WIDTH * (3300 / 2550)); // 725

/** Transparent 1×1 GIF used as placeholder before lazy-loaded images arrive. */
const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Number of pages loaded immediately on startup (first N pages). */
const EAGER_COUNT = 6;

/** How many pages ahead/behind the current page to preload when turning. */
const PRELOAD_RADIUS = 3;

// ─────────────────────────────────────────────────────────────────────────────
// FLIPBOOK CLASS
// ─────────────────────────────────────────────────────────────────────────────

class Flipbook {
    constructor() {
        /** @type {HTMLElement|null} */
        this.container = document.getElementById('flipbook-container');
        /** @type {HTMLElement|null} */
        this.dataEl = document.getElementById('flipbook-data');
        /** @type {HTMLButtonElement|null} */
        this.prevBtn = document.getElementById('flipbook-prev');
        /** @type {HTMLButtonElement|null} */
        this.nextBtn = document.getElementById('flipbook-next');
        /** @type {HTMLElement|null} */
        this.currentPageEl = document.getElementById('flipbook-current-page');
        /** @type {HTMLElement|null} */
        this.totalPagesEl  = document.getElementById('flipbook-total-pages');

        /** Raw CMS page entries: Array<{ image: string, alt?: string }> */
        this.rawPages = [];

        /** Generated DOM page elements fed to PageFlip */
        this.pageElements = [];

        /** Set of page-element indices already having their src loaded */
        this.loadedSet = new Set();

        /** @type {PageFlip|null} */
        this.flipInstance = null;

        // Abort if required DOM elements are missing (not on a flipbook page)
        if (!this.container || !this.dataEl) return;

        this._parseCmsData();
        this._init();
    }

    // ─── Data Parsing ─────────────────────────────────────────────────────────

    _parseCmsData() {
        try {
            const raw = JSON.parse(this.dataEl.textContent);
            this.rawPages = Array.isArray(raw) ? raw : [];
        } catch (err) {
            console.error('[Flipbook] Failed to parse CMS data:', err);
            this._showError('Unable to load flipbook data. Please try refreshing.');
        }
    }

    // ─── Initialisation ───────────────────────────────────────────────────────

    async _init() {
        if (this.rawPages.length === 0) {
            this._showError('This flipbook has no pages yet. Add pages through the CMS.');
            this._hideLoader();
            return;
        }

        try {
            // 1. Measure every image to determine single vs. double spread
            const classified = await this._classifyAllPages();

            // 2. Build the DOM elements PageFlip will consume
            this._buildDOM(classified);

            // 3. Boot PageFlip
            this._initPageFlip();

            // 4. Wire controls
            this._initNav();
            this._initKeyboard();

        } catch (err) {
            console.error('[Flipbook] Initialisation error:', err);
            this._showError('The flipbook could not be loaded. Please try again.');
        } finally {
            this._hideLoader();
        }
    }

    // ─── Image Classification ─────────────────────────────────────────────────

    /**
     * Measures the natural width of every CMS page image and classifies it.
     * @returns {Promise<ClassifiedPage[]>}
     */
    async _classifyAllPages() {
        const warnings = [];
        const classified = [];

        for (const entry of this.rawPages) {
            const { width, height } = await this._measureImage(entry.image);
            const type = this._detectType(width, height, entry.image, warnings);

            classified.push({
                image : entry.image,
                alt   : entry.alt || '',
                width,
                height,
                type,
            });
        }

        if (warnings.length) this._showWarnings(warnings);
        return classified;
    }

    /**
     * Loads an image invisibly just to read its naturalWidth / naturalHeight.
     * Resolves even on error (returns fallback dimensions) to avoid blocking.
     *
     * @param {string} src
     * @returns {Promise<{width:number, height:number}>}
     */
    _measureImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => {
                console.warn(`[Flipbook] Could not measure image: ${src}`);
                resolve({ width: SINGLE_WIDTH, height: 3300 }); // safe fallback
            };
            img.src = src;
        });
    }

    /**
     * Returns 'single' or 'double' based on measured width.
     *
     * @param {number} width
     * @param {number} height
     * @param {string} src    – used in warning messages
     * @param {string[]} warnings – warning strings appended here
     * @returns {'single'|'double'}
     */
    _detectType(width, height, src, warnings) {
        const nearSingle = Math.abs(width - SINGLE_WIDTH) <= TOLERANCE;
        const nearDouble = Math.abs(width - DOUBLE_WIDTH) <= TOLERANCE;

        if (nearSingle) return 'single';
        if (nearDouble) return 'double';

        // Out of spec – warn and pick the closest match
        const closerToSingle = Math.abs(width - SINGLE_WIDTH) < Math.abs(width - DOUBLE_WIDTH);
        const expected = closerToSingle ? '2550 × 3300 (single)' : '5100 × 3300 (double)';
        warnings.push(
            `An image is ${width} × ${height} px. ` +
            `Expected 2550 × 3300 for a single page or 5100 × 3300 for a double spread. ` +
            `Treating it as ${expected}. ` +
            `Please re-upload the correct size.`
        );

        return closerToSingle ? 'single' : 'double';
    }

    // ─── DOM Building ─────────────────────────────────────────────────────────

    /**
     * Creates all page <div> elements and appends them to the container.
     *
     * Single pages → one div
     * Double spreads → two divs (left half / right half of the same image)
     *
     * @param {ClassifiedPage[]} pages
     */
    _buildDOM(pages) {
        const frag = document.createDocumentFragment();

        pages.forEach(page => {
            if (page.type === 'single') {
                const el = this._makeSinglePage(page, this.pageElements.length);
                frag.appendChild(el);
                this.pageElements.push(el);
            } else {
                // Double spread → left half then right half
                const leftIdx  = this.pageElements.length;
                const rightIdx = leftIdx + 1;
                const leftEl   = this._makeSpreadHalf(page, 'left',  leftIdx);
                const rightEl  = this._makeSpreadHalf(page, 'right', rightIdx);
                frag.appendChild(leftEl);
                frag.appendChild(rightEl);
                this.pageElements.push(leftEl, rightEl);
            }
        });

        this.container.appendChild(frag);
    }

    /**
     * Creates a single-page element.
     *
     * @param {ClassifiedPage} page
     * @param {number} index  – position in this.pageElements
     * @returns {HTMLDivElement}
     */
    _makeSinglePage(page, index) {
        const div = document.createElement('div');
        div.className = 'fp-page fp-page--single';
        div.setAttribute('role', 'img');
        div.setAttribute('aria-label', page.alt || `Page ${index + 1}`);

        const img = document.createElement('img');
        img.className = 'fp-page__img';
        img.alt = page.alt || '';
        img.dataset.src   = page.image;
        img.dataset.index = index;

        if (index < EAGER_COUNT) {
            img.src = page.image;
            this.loadedSet.add(index);
        } else {
            img.src = PLACEHOLDER;
        }

        div.appendChild(img);
        return div;
    }

    /**
     * Creates one half of a double-spread element.
     *
     * CSS shows only the correct half by positioning the full-width image
     * left or right inside an overflow:hidden container.
     *
     * @param {ClassifiedPage} page
     * @param {'left'|'right'} side
     * @param {number} index
     * @returns {HTMLDivElement}
     */
    _makeSpreadHalf(page, side, index) {
        const div = document.createElement('div');
        div.className = `fp-page fp-page--spread fp-page--spread-${side}`;
        div.setAttribute('role', 'img');

        if (side === 'left') {
            div.setAttribute('aria-label', page.alt || `Page ${index + 1}`);
        } else {
            div.setAttribute('aria-hidden', 'true');
        }

        const inner = document.createElement('div');
        inner.className = 'fp-spread-inner';

        const img = document.createElement('img');
        img.className = 'fp-spread-img';
        img.alt = side === 'left' ? page.alt : '';
        img.dataset.src   = page.image;
        img.dataset.index = index;
        img.dataset.side  = side;

        if (index < EAGER_COUNT) {
            img.src = page.image;
            this.loadedSet.add(index);
        } else {
            img.src = PLACEHOLDER;
        }

        inner.appendChild(img);
        div.appendChild(inner);
        return div;
    }

    // ─── Lazy Loading ─────────────────────────────────────────────────────────

    /**
     * Loads images for page elements within PRELOAD_RADIUS of centerIndex.
     *
     * @param {number} centerIndex – current page index (0-based)
     */
    _loadAround(centerIndex) {
        const from = Math.max(0, centerIndex - PRELOAD_RADIUS);
        const to   = Math.min(this.pageElements.length - 1, centerIndex + PRELOAD_RADIUS);

        for (let i = from; i <= to; i++) {
            if (this.loadedSet.has(i)) continue;

            const el = this.pageElements[i];
            if (!el) continue;

            el.querySelectorAll('img[data-src]').forEach(img => {
                const src = img.dataset.src;
                if (src && img.src !== src) {
                    img.src = src;
                }
            });

            this.loadedSet.add(i);
        }
    }

    // ─── PageFlip Initialisation ──────────────────────────────────────────────

    _initPageFlip() {
        this.flipInstance = new PageFlip(this.container, {
            width        : DISPLAY_WIDTH,
            height       : DISPLAY_HEIGHT,
            size         : 'fixed',
            minWidth     : 260,
            maxWidth     : 900,
            minHeight    : 336,
            maxHeight    : 1164,
            drawShadow   : true,
            flippingTime : 800,
            /**
             * usePortrait: true → switches to single-page layout when the
             * viewport is narrower than two page-widths (i.e., mobile).
             */
            usePortrait         : true,
            autoSize            : true,
            maxShadowOpacity    : 0.5,
            showCover           : true,
            mobileScrollSupport : false,
            swipeDistance       : 30,
            clickEventForward   : true,
            useMouseEvents      : true,
            disableFlipByClick  : false,
        });

        // Feed all .fp-page elements to PageFlip
        this.flipInstance.loadFromHTML(
            this.container.querySelectorAll('.fp-page')
        );

        // After init: update counter + preload initial pages
        this.flipInstance.on('init', e => {
            const total = this.flipInstance.getPageCount();
            if (this.totalPagesEl) this.totalPagesEl.textContent = total;
            this._updateCounter(e.data.page);
            this._loadAround(e.data.page);
        });

        // On every page turn: update counter + lazy-load nearby pages
        this.flipInstance.on('flip', e => {
            this._updateCounter(e.data);
            this._loadAround(e.data);
        });
    }

    // ─── Navigation Controls ──────────────────────────────────────────────────

    _initNav() {
        this.prevBtn?.addEventListener('click', () => {
            this.flipInstance?.flipPrev('bottom');
        });
        this.nextBtn?.addEventListener('click', () => {
            this.flipInstance?.flipNext('bottom');
        });
    }

    _initKeyboard() {
        this.container.addEventListener('keydown', e => {
            if (!this.flipInstance) return;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    this.flipInstance.flipNext('bottom');
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    this.flipInstance.flipPrev('bottom');
                    break;
                case 'Home':
                    e.preventDefault();
                    this.flipInstance.flip(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.flipInstance.flip(this.flipInstance.getPageCount() - 1);
                    break;
            }
        });
    }

    /**
     * Updates the current-page counter and disables edge buttons.
     *
     * @param {number} pageIndex – 0-based index from PageFlip
     */
    _updateCounter(pageIndex) {
        if (this.currentPageEl) {
            this.currentPageEl.textContent = pageIndex + 1;
        }

        const total = this.flipInstance?.getPageCount() ?? 0;

        if (this.prevBtn) {
            this.prevBtn.disabled = pageIndex === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = total > 0 && pageIndex >= total - 1;
        }
    }

    // ─── UI Utilities ──────────────────────────────────────────────────────────

    _hideLoader() {
        const el = document.getElementById('flipbook-loader');
        if (el) el.style.display = 'none';
    }

    _showError(message) {
        this._hideLoader();
        const el = document.getElementById('flipbook-error');
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    }

    /**
     * Appends individual warning strings to the warnings panel.
     *
     * @param {string[]} warnings
     */
    _showWarnings(warnings) {
        const panel = document.getElementById('flipbook-warnings');
        if (!panel) return;

        const ul = document.createElement('ul');
        ul.className = 'flipbook-warnings__list';
        warnings.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            ul.appendChild(li);
        });

        panel.appendChild(ul);
        panel.style.display = 'block';
    }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Flipbook());
} else {
    new Flipbook();
}

// ─── Type Definitions (JSDoc) ─────────────────────────────────────────────────

/**
 * @typedef {Object} ClassifiedPage
 * @property {string}          image  – URL of the page image
 * @property {string}          alt    – Accessible description
 * @property {number}          width  – Measured natural width in px
 * @property {number}          height – Measured natural height in px
 * @property {'single'|'double'} type – Detected page type
 */
