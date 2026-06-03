// ── UTILITIES ──

/**
 * Copy the code inside a .code-block to clipboard.
 * Called from onclick="copyCode(this)" on .copy-btn buttons.
 */
function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  const text = (pre.innerText || pre.textContent).trim();

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg> Copied!`;

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg> Copy`;
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/**
 * Build a correct image URL from an API-returned image path.
 * - Full URL (starts with http) → use as-is
 * - Partial path → prepend CDN base + append _L.jpg
 */
const CDN_BASE = 'https://d2cazmkfw8kdtj.cloudfront.net';

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return CDN_BASE + imagePath + '_L.jpg';
}
