/* ============ APP LOGIC ============ */
const CHAPTERS = window.CHAPTERS || [];

const navList = document.getElementById('navList');
const container = document.getElementById('chapterContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const themeToggle = document.getElementById('themeToggle');
const searchBox = document.getElementById('searchBox');
const sidebar = document.getElementById('sidebar');
const mobileMenu = document.getElementById('mobileMenu');

let currentIndex = 0;
const READ_KEY = 'sd_read_chapters_v1';
const THEME_KEY = 'sd_theme_v1';

/* ---------- Build sidebar ---------- */
function buildSidebar(filter = '') {
  navList.innerHTML = '';
  let currentGroup = null;
  const read = getRead();
  const filterLower = filter.toLowerCase();

  CHAPTERS.forEach((ch, idx) => {
    if (filter && !(ch.title.toLowerCase().includes(filterLower) || ch.group.toLowerCase().includes(filterLower))) return;

    if (ch.group !== currentGroup) {
      const g = document.createElement('div');
      g.className = 'nav-group-title';
      g.textContent = ch.group;
      navList.appendChild(g);
      currentGroup = ch.group;
    }
    const item = document.createElement('div');
    item.className = 'nav-item' + (idx === currentIndex ? ' active' : '') + (read.includes(idx) ? ' done' : '');
    item.innerHTML = `<span>${ch.icon}</span><span>${ch.title}</span>`;
    item.onclick = () => loadChapter(idx);
    navList.appendChild(item);
  });
}

/* ---------- Load chapter ---------- */
function loadChapter(idx) {
  if (idx < 0 || idx >= CHAPTERS.length) return;
  currentIndex = idx;
  const ch = CHAPTERS[idx];
  container.innerHTML = `<div class="chapter">${ch.content}</div>`;
  pageInfo.textContent = `Chương ${idx + 1} / ${CHAPTERS.length}`;
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === CHAPTERS.length - 1;
  markRead(idx);
  buildSidebar(searchBox.value);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  location.hash = `chapter-${idx + 1}`;
  sidebar.classList.remove('open');
}

/* ---------- Progress ---------- */
function getRead() {
  try { return JSON.parse(localStorage.getItem(READ_KEY)) || []; }
  catch { return []; }
}
function markRead(idx) {
  const r = getRead();
  if (!r.includes(idx)) { r.push(idx); localStorage.setItem(READ_KEY, JSON.stringify(r)); }
  updateProgress();
}
function updateProgress() {
  const r = getRead();
  const pct = (r.length / CHAPTERS.length) * 100;
  progressFill.style.width = pct + '%';
  progressText.textContent = `${r.length} / ${CHAPTERS.length}`;
}

/* ---------- Theme ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, t);
}
themeToggle.onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
};

/* ---------- Pagination ---------- */
prevBtn.onclick = () => loadChapter(currentIndex - 1);
nextBtn.onclick = () => loadChapter(currentIndex + 1);

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft') loadChapter(currentIndex - 1);
  if (e.key === 'ArrowRight') loadChapter(currentIndex + 1);
});

/* ---------- Search ---------- */
searchBox.addEventListener('input', e => buildSidebar(e.target.value));

/* ---------- Mobile ---------- */
mobileMenu.onclick = () => sidebar.classList.toggle('open');

/* ---------- Quiz handler (delegated) ---------- */
document.addEventListener('click', e => {
  if (e.target.classList.contains('quiz-option')) {
    const opt = e.target;
    const correct = opt.dataset.correct === 'true';
    opt.classList.add(correct ? 'correct' : 'wrong');
    if (correct) {
      setTimeout(() => alert('🎉 Chính xác! Bạn đang trên đường thành Senior Engineer!'), 50);
    }
  }
});

/* ---------- Init ---------- */
(function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  const hash = location.hash.match(/chapter-(\d+)/);
  const start = hash ? Math.max(0, parseInt(hash[1]) - 1) : 0;
  buildSidebar();
  loadChapter(start);
  updateProgress();
})();
