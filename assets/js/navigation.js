// ── NAVIGATION ──

const PAGE_TITLES = {
  introduction:           'Introduction',
  implementation:         'Implementation Approach',
  downloads:              'Documentation & Downloads',
  faq:                    'FAQ',
  contact:                'Contact Us',
  process:                'Process Description',
  country:                'Country',
  city:                   'City',
  'static-data':          'Tour Static Data',
  'static-data-by-id':    'Tour Static Data by Id',
  'option-static-data':   'Option Static Data',
  'tour-price':           'Tour Price',
  'tour-options':         'Tour Options',
  'tour-timeslot':        'Tour Timeslot',
  'tour-availability':    'Tour Availability',
  'cancellation-policy':  'Tour Cancellation Policy',
  'tour-booking':         'Tour Booking',
  'ticket-details':       'Ticket Details',
  'tour-cancellation':    'Tour Cancellation',
};

// Cache fetched pages
const pageCache = {};

/**
 * Toggle an expandable nav group open/closed.
 * If a defaultPage is provided, load it when opening.
 */
function toggleGroup(triggerId, defaultPage) {
  const trigger  = document.getElementById(triggerId);
  const subList  = document.getElementById(triggerId + '-list');
  if (!trigger || !subList) return;

  const isOpen = trigger.classList.contains('open');

  if (isOpen) {
    trigger.classList.remove('open', 'active');
    subList.classList.remove('open');
  } else {
    trigger.classList.add('open', 'active');
    subList.classList.add('open');
    if (defaultPage) {
      const subEl = document.querySelector(`.nav-sub-item[data-page="${defaultPage}"]`);
      showPage(defaultPage, triggerId, subEl);
    }
  }
}

/**
 * Load a page by id. Fetches pages/{id}.html and injects into #content.
 * el = the nav element to mark active (nav-item or nav-sub-item)
 */
async function showPage(id, groupTriggerId, el) {
  // Clear all active states
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(n => n.classList.remove('active'));

  // Mark the clicked element active
  if (el) el.classList.add('active');

  // If this page belongs to a group, keep the group trigger highlighted
  if (groupTriggerId) {
    const trigger = document.getElementById(groupTriggerId);
    if (trigger) trigger.classList.add('active');
  }

  // Update breadcrumb
  const bc = document.getElementById('breadcrumbCurrent');
  if (bc) bc.textContent = PAGE_TITLES[id] || id;

  // Update URL hash
  history.pushState({ page: id, group: groupTriggerId }, '', '#' + id);

  const content = document.getElementById('content');
  const loading = document.getElementById('content-loading');

  content.style.display = 'none';
  if (loading) loading.classList.add('visible');

  try {
    if (!pageCache[id]) {
      const res = await fetch(`pages/${id}.html`);
      if (!res.ok) throw new Error(`Not found: ${id}`);
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
 * Filter sidebar nav items AND group triggers based on search input.
 */
function filterNav(q) {
  const term = q.toLowerCase().trim();

  // Filter regular nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle('hidden', term !== '' && !text.includes(term));
  });

  // Filter group triggers and their sub-items
  document.querySelectorAll('.nav-group-trigger').forEach(trigger => {
    const subList = document.getElementById(trigger.id + '-list');
    const subItems = subList ? subList.querySelectorAll('.nav-sub-item') : [];
    const triggerText = trigger.textContent.toLowerCase();

    let anySubMatch = false;
    subItems.forEach(sub => {
      const match = term === '' || sub.textContent.toLowerCase().includes(term);
      sub.classList.toggle('hidden', !match);
      if (match) anySubMatch = true;
    });

    const triggerMatch = term === '' || triggerText.includes(term) || anySubMatch;
    trigger.classList.toggle('hidden', !triggerMatch);

    // Auto-expand group if sub-items match
    if (term && anySubMatch) {
      trigger.classList.add('open');
      if (subList) subList.classList.add('open');
    }
  });

  const noResult = document.getElementById('no-result');
  if (noResult) {
    const anyVisible =
      [...document.querySelectorAll('.nav-item')].some(i => !i.classList.contains('hidden')) ||
      [...document.querySelectorAll('.nav-group-trigger')].some(i => !i.classList.contains('hidden'));
    noResult.style.display = (!anyVisible && term) ? 'block' : 'none';
  }
}

/**
 * Restore page state from URL hash on load / back-forward.
 */
function restoreFromHash(hash) {
  if (!hash) hash = 'introduction';

  // Check if it belongs to a group
  const subEl = document.querySelector(`.nav-sub-item[data-page="${hash}"]`);
  if (subEl) {
    const subList = subEl.closest('.nav-sub-list');
    const triggerId = subList ? subList.id.replace('-list', '') : null;
    if (triggerId) {
      const trigger = document.getElementById(triggerId);
      if (trigger) trigger.classList.add('open', 'active');
      if (subList) subList.classList.add('open');
    }
    showPage(hash, triggerId, subEl);
    return;
  }

  // Regular nav item
  const navEl = document.querySelector(`.nav-item[data-page="${hash}"]`);
  showPage(hash, null, navEl);
}

document.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.replace('#', '');
  restoreFromHash(hash);
});

window.addEventListener('popstate', (e) => {
  const id = (e.state && e.state.page) || 'introduction';
  restoreFromHash(id);
});
