// ── NAVIGATION ──

const PAGE_TITLES = {
  introduction:        'Introduction',
  implementation:      'Implementation Approach',
  downloads:           'Documentation & Downloads',
  faq:                 'FAQ',
  contact:             'Contact Us',
  process:             'Process Description',
  country:             'Country',
  city:                'City',
  'static-data':       'Static Data',
  'tour-price':        'Tour Price',
  'tour-options':      'Tour Options',
  'tour-timeslot':     'Tour Timeslot',
  'tour-availability': 'Tour Availability',
  'cancellation-policy': 'Tour Cancellation Policy',
  'tour-booking':      'Tour Booking',
  'ticket-details':    'Ticket Details',
  'tour-cancellation': 'Tour Cancellation',
};

// Cache fetched pages so we don't re-fetch on every click
const pageCache = {};

/**
 * Load a page by id. Fetches pages/{id}.html and injects into #content.
 */
async function showPage(id, el) {
  // Update nav active states
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  // Update breadcrumb
  const bc = document.getElementById('breadcrumbCurrent');
  if (bc) bc.textContent = PAGE_TITLES[id] || id;

  // Update URL hash (for bookmarking / sharing)
  history.pushState({ page: id }, '', '#' + id);

  const content    = document.getElementById('content');
  const loading    = document.getElementById('content-loading');

  // Show loader
  content.style.display = 'none';
  if (loading) loading.classList.add('visible');

  try {
    // Serve from cache if available
    if (!pageCache[id]) {
      const res = await fetch(`pages/${id}.html`);
      if (!res.ok) throw new Error(`Page not found: ${id}`);
      pageCache[id] = await res.text();
    }

    content.innerHTML = pageCache[id];
    content.style.display = 'block';
    window.scrollTo(0, 0);
  } catch (err) {
    content.innerHTML = `
      <div class="placeholder-notice">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>Content for <strong>${PAGE_TITLES[id] || id}</strong> is coming soon.</p>
      </div>`;
    content.style.display = 'block';
  } finally {
    if (loading) loading.classList.remove('visible');
  }
}

/**
 * Filter sidebar nav items based on search input.
 */
function filterNav(q) {
  const term = q.toLowerCase().trim();
  document.querySelectorAll('.nav-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle('hidden', term !== '' && !text.includes(term));
  });

  const noResult = document.getElementById('no-result');
  if (noResult) {
    const anyVisible = [...document.querySelectorAll('.nav-item')]
      .some(i => !i.classList.contains('hidden'));
    noResult.style.display = (!anyVisible && term) ? 'block' : 'none';
  }
}

/**
 * On load: read hash from URL or default to introduction.
 */
document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.replace('#', '') || 'introduction';
  const navEl = document.querySelector(`.nav-item[data-page="${hash}"]`);
  showPage(hash, navEl);
});

/**
 * Handle browser back/forward.
 */
window.addEventListener('popstate', (e) => {
  const id = (e.state && e.state.page) || 'introduction';
  const navEl = document.querySelector(`.nav-item[data-page="${id}"]`);
  showPage(id, navEl);
});
