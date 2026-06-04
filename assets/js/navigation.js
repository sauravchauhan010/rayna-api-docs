// ── NAVIGATION ──

const PAGE_TITLES = {
  introduction:            'Introduction',
  implementation:          'Implementation Approach',
  downloads:               'Documentation & Downloads',
  faq:                     'FAQ',
  contact:                 'Contact Us',
  process:                 'Process Description',
  country:                 'Country',
  city:                    'City',
  'static-data':           'Tour Static Data',
  'static-data-by-id':     'Tour Static Data by Id',
  'option-static-data':    'Option Static Data',
  'tour-price':            'Tour Price',
  'tour-options':          'Tour Options',
  'tour-timeslot':         'Tour Timeslot',
  'tour-availability':     'Tour Availability',
  'cancellation-policy':   'Tour Cancellation Policy',
  'tour-booking':          'Tour Booking',
  'ticket-details':        'Ticket Details',
  'tour-cancellation':     'Tour Cancellation',
};

const pageCache = {};

// ── LOAD PAGE ──
async function loadPage(id, groupTriggerId) {
  // Clear all active states
  document.querySelectorAll('.nav-item, .nav-sub-item, .nav-group-trigger').forEach(n => {
    n.classList.remove('active');
  });

  // Mark nav item or sub-item active
  const navEl = document.querySelector(
    `.nav-item[data-page="${id}"], .nav-sub-item[data-page="${id}"]`
  );
  if (navEl) navEl.classList.add('active');

  // Keep group trigger highlighted if sub-page
  if (groupTriggerId) {
    const trigger = document.getElementById(groupTriggerId);
    if (trigger) trigger.classList.add('active');
  }

  // Breadcrumb
  const bc = document.getElementById('breadcrumbCurrent');
  if (bc) bc.textContent = PAGE_TITLES[id] || id;

  // URL hash
  history.pushState({ page: id }, '', '#' + id);

  const content = document.getElementById('content');
  const loading = document.getElementById('content-loading');

  content.style.display = 'none';
  if (loading) loading.classList.add('visible');

  try {
    if (!pageCache[id]) {
      const res = await fetch(`pages/${id}.html`);
      if (!res.ok) throw new Error('not found');
      pageCache[id] = await res.text();
    }
    content.innerHTML = pageCache[id];
    content.style.display = 'block';
    window.scrollTo(0, 0);
  } catch (e) {
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

// ── TOGGLE GROUP ──
function openGroup(triggerId) {
  const trigger = document.getElementById(triggerId);
  const subList = document.getElementById(triggerId + '-list');
  if (!trigger || !subList) return;
  trigger.classList.add('open');
  subList.classList.add('open');
}

function closeGroup(triggerId) {
  const trigger = document.getElementById(triggerId);
  const subList = document.getElementById(triggerId + '-list');
  if (!trigger || !subList) return;
  trigger.classList.remove('open', 'active');
  subList.classList.remove('open');
}

// ── SEARCH ──
function filterNav(q) {
  const term = q.toLowerCase().trim();

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('hidden', term !== '' && !item.textContent.toLowerCase().includes(term));
  });

  document.querySelectorAll('.nav-group-trigger').forEach(trigger => {
    const subList = document.getElementById(trigger.id + '-list');
    const subs = subList ? subList.querySelectorAll('.nav-sub-item') : [];
    let anyMatch = false;

    subs.forEach(sub => {
      const match = term === '' || sub.textContent.toLowerCase().includes(term);
      sub.classList.toggle('hidden', !match);
      if (match) anyMatch = true;
    });

    const show = term === '' || trigger.textContent.toLowerCase().includes(term) || anyMatch;
    trigger.classList.toggle('hidden', !show);

    if (term && anyMatch && subList) {
      trigger.classList.add('open');
      subList.classList.add('open');
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

// ── RESTORE FROM HASH ──
function restoreFromHash(hash) {
  if (!hash) hash = 'introduction';

  // Check if it belongs to a group
  const subEl = document.querySelector(`.nav-sub-item[data-page="${hash}"]`);
  if (subEl) {
    const subList = subEl.closest('.nav-sub-list');
    const triggerId = subList ? subList.id.replace('-list', '') : null;
    if (triggerId) openGroup(triggerId);
    loadPage(hash, triggerId);
    return;
  }

  loadPage(hash, null);
}

// ── BIND ALL EVENT LISTENERS ON DOM READY ──
document.addEventListener('DOMContentLoaded', () => {

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => filterNav(searchInput.value));
  }

  // Regular nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => loadPage(item.dataset.page, null));
  });

  // Group triggers
  document.querySelectorAll('.nav-group-trigger[data-group]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.classList.contains('open');
      const groupId = trigger.dataset.group;
      const defaultPage = trigger.dataset.default;

      if (isOpen) {
        closeGroup(groupId);
      } else {
        openGroup(groupId);
        if (defaultPage) loadPage(defaultPage, groupId);
      }
    });
  });

  // Sub-items
  document.querySelectorAll('.nav-sub-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const subList = item.closest('.nav-sub-list');
      const triggerId = subList ? subList.id.replace('-list', '') : null;
      loadPage(item.dataset.page, triggerId);
    });
  });

  // Restore from URL hash
  const hash = location.hash.replace('#', '');
  restoreFromHash(hash);
});

// Browser back/forward
window.addEventListener('popstate', (e) => {
  const id = (e.state && e.state.page) || 'introduction';
  restoreFromHash(id);
});
