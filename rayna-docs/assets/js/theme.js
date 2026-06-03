// ── THEME ──
// Apply saved theme immediately (before DOM paint) to avoid flash
(function () {
  const saved = localStorage.getItem('rayna-docs-theme');
  if (saved === 'light') document.documentElement.classList.add('light');
})();

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('rayna-docs-theme', isLight ? 'light' : 'dark');
}
