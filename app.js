/* ===== Tempus — Core App Logic ===== */

// ===== Config =====
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/aFaaEZ8XR50f82n0HsbMQ01';
const FREE_MAX_COUNTDOWNS = 2;
const STORAGE_KEYS = {
  events: 'tempus_events',
  premium: 'tempus_premium',
  theme: 'tempus_theme'
};

// ===== Themes =====
const THEMES = [
  { id: 'default', name: 'Indigo', color: '#5e6ad2', free: true },
  { id: 'electric-blue', name: 'Electric Blue', color: '#3b82f6', free: false },
  { id: 'neon-mint', name: 'Neon Mint', color: '#10b981', free: false },
  { id: 'purple-dream', name: 'Purple Dream', color: '#8b5cf6', free: false },
  { id: 'sunset-orange', name: 'Sunset', color: '#f59e0b', free: false },
  { id: 'rose-gold', name: 'Rose Gold', color: '#ec4899', free: false },
  { id: 'arctic', name: 'Arctic', color: '#06b6d4', free: false },
  { id: 'midnight', name: 'Midnight', color: '#6366f1', free: false },
  { id: 'forest', name: 'Forest', color: '#22c55e', free: false },
];

// ===== State =====
let events = [];
let isPremium = false;
let currentTheme = 'default';
let deleteTargetId = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  checkPremiumOnLoad();
  loadState();
  initYearProgress();
  renderCountdowns();
  renderThemeGrid();
  updatePremiumUI();
  bindEvents();
  registerSW();
});

// ===== Premium Check =====
function checkPremiumOnLoad() {
  // Check URL params for premium activation
  const params = new URLSearchParams(window.location.search);
  if (params.get('premium') === 'activated') {
    localStorage.setItem(STORAGE_KEYS.premium, 'true');
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function checkPremium() {
  return localStorage.getItem(STORAGE_KEYS.premium) === 'true';
}

function unlockPremium() {
  // Redirect to Stripe Payment Link
  const returnUrl = encodeURIComponent(window.location.origin + window.location.pathname + '?premium=activated');
  const paymentUrl = STRIPE_PAYMENT_LINK.includes('?')
    ? `${STRIPE_PAYMENT_LINK}&success_url=${returnUrl}`
    : `${STRIPE_PAYMENT_LINK}?success_url=${returnUrl}`;

  // If using placeholder link, just activate premium (demo mode)
  if (STRIPE_PAYMENT_LINK.includes('YOUR_LINK_HERE')) {
    localStorage.setItem(STORAGE_KEYS.premium, 'true');
    isPremium = true;
    updatePremiumUI();
    renderCountdowns();
    renderThemeGrid();
    showToast('Premium activated! (Demo mode)');
    return;
  }

  window.location.href = paymentUrl;
}

function updatePremiumUI() {
  isPremium = checkPremium();
  const banner = document.getElementById('premiumBanner');
  const status = document.getElementById('premiumStatus');

  if (isPremium) {
    banner.style.display = 'none';
    status.innerHTML = '<span class="status-badge premium">✦ Premium</span>';
  } else {
    banner.style.display = 'flex';
    status.innerHTML = '<span class="status-badge free">Free</span>';
  }
}

// ===== State Management =====
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.events);
    events = saved ? JSON.parse(saved) : [];
  } catch {
    events = [];
  }
  isPremium = checkPremium();
  currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'default';
  setTheme(currentTheme);
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

// ===== Year Progress =====
function initYearProgress() {
  const now = new Date();
  const year = now.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeap ? 366 : 365;

  const start = new Date(year, 0, 1);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000) + 1;
  const daysRemaining = totalDays - dayOfYear;
  const percentage = ((dayOfYear / totalDays) * 100).toFixed(1);
  const weeksRemaining = Math.floor(daysRemaining / 7);

  // Update stats
  document.getElementById('yearPercent').textContent = `${percentage}%`;
  document.getElementById('currentYear').textContent = year;
  document.getElementById('dayOfYear').textContent = dayOfYear;
  document.getElementById('daysRemaining').textContent = daysRemaining;
  document.getElementById('weeksRemaining').textContent = weeksRemaining;

  // Render dot grid
  const grid = document.getElementById('dotGrid');
  grid.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= totalDays; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i < dayOfYear) {
      dot.classList.add('past');
    } else if (i === dayOfYear) {
      dot.classList.add('today');
    } else {
      dot.classList.add('future');
    }
    // Stagger animation
    dot.style.animationDelay = `${(i % 40) * 8}ms`;
    fragment.appendChild(dot);
  }
  grid.appendChild(fragment);
}

// ===== Countdowns =====
function renderCountdowns() {
  const list = document.getElementById('countdownsList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('countdownCount');

  if (events.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    count.textContent = '0';
    return;
  }

  empty.style.display = 'none';
  count.textContent = events.length;

  // Sort: upcoming first, past at end
  const sorted = [...events].sort((a, b) => {
    const da = new Date(a.date) - new Date();
    const db = new Date(b.date) - new Date();
    if (da >= 0 && db >= 0) return da - db;
    if (da < 0 && db < 0) return db - da;
    return da >= 0 ? -1 : 1;
  });

  list.innerHTML = sorted.map(event => {
    const now = new Date();
    const target = new Date(event.date + 'T00:00:00');
    const diffMs = target - now;
    const diffDays = Math.ceil(diffMs / 86400000);
    const isPast = diffDays < 0;
    const absDays = Math.abs(diffDays);

    // Progress: from creation to target
    const created = new Date(event.created);
    const totalSpan = target - created;
    const elapsed = now - created;
    const progress = totalSpan > 0 ? Math.min(100, Math.max(0, (elapsed / totalSpan) * 100)) : 100;

    // Detail text
    let detailText = '';
    if (isPast) {
      detailText = `${absDays} day${absDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      detailText = 'Today!';
    } else if (diffDays === 1) {
      detailText = 'Tomorrow';
    } else {
      const weeks = Math.floor(absDays / 7);
      const days = absDays % 7;
      if (weeks > 0) {
        detailText = `${weeks}w ${days}d remaining`;
      } else {
        detailText = `${absDays} day${absDays !== 1 ? 's' : ''} remaining`;
      }
    }

    const dateStr = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <div class="countdown-card ${isPast ? 'card-passed' : ''}" style="--card-color: ${event.color}" data-id="${event.id}">
        <div class="card-top">
          <div>
            <div class="card-name">${escapeHtml(event.name)}</div>
            <div class="card-date">${dateStr}</div>
          </div>
          <div class="card-days">
            <div class="card-days-number">${isPast ? '+' : ''}${absDays}</div>
            <div class="card-days-label">${diffDays === 0 ? 'today' : 'days'}</div>
          </div>
        </div>
        <div class="card-progress">
          <div class="card-progress-fill" style="width:${progress}%; background:${event.color}"></div>
        </div>
        <div class="card-bottom">
          <span class="card-detail">${detailText}</span>
          <button class="card-delete" data-id="${event.id}" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addEvent(name, dateStr, color) {
  if (!isPremium && events.length >= FREE_MAX_COUNTDOWNS) {
    showToast('Upgrade to Premium for unlimited countdowns!');
    return false;
  }

  const event = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    date: dateStr,
    color,
    created: new Date().toISOString()
  };

  events.push(event);
  saveEvents();
  renderCountdowns();
  return true;
}

function deleteEvent(id) {
  events = events.filter(e => e.id !== id);
  saveEvents();
  renderCountdowns();
}

// ===== Themes =====
function setTheme(themeId) {
  if (themeId === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeId);
  }
  currentTheme = themeId;
  localStorage.setItem(STORAGE_KEYS.theme, themeId);

  // Update active theme in grid
  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === themeId);
  });
}

function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = THEMES.map(theme => {
    const locked = !theme.free && !isPremium;
    return `
      <div class="theme-option ${currentTheme === theme.id ? 'active' : ''} ${locked ? 'locked' : ''}"
           data-theme="${theme.id}" ${locked ? 'data-locked="true"' : ''}>
        ${locked ? '<span class="theme-lock">🔒</span>' : ''}
        <div class="theme-swatch" style="background:${theme.color}"></div>
        <span class="theme-name">${theme.name}</span>
      </div>
    `;
  }).join('');
}

// ===== Modals =====
function showModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// ===== Events Binding =====
function bindEvents() {
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => showModal('settingsModal'));

  // Add Event
  document.getElementById('addEventBtn').addEventListener('click', () => {
    if (!isPremium && events.length >= FREE_MAX_COUNTDOWNS) {
      showToast('Upgrade to Premium for unlimited countdowns!');
      return;
    }
    document.getElementById('eventName').value = '';
    document.getElementById('eventDate').value = '';
    // Set min date to today
    document.getElementById('eventDate').min = new Date().toISOString().split('T')[0];
    showModal('addEventModal');
  });

  // Close modals
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.classList.contains('modal-close')) {
        const modalId = el.dataset.modal || el.id;
        if (modalId) hideModal(modalId);
      }
    });
  });

  // Prevent modal content clicks from closing
  document.querySelectorAll('.modal').forEach(el => {
    el.addEventListener('click', e => e.stopPropagation());
  });

  // Cancel button in delete modal
  document.querySelector('#deleteModal .btn-secondary').addEventListener('click', () => {
    hideModal('deleteModal');
  });

  // Color picker
  document.getElementById('colorPicker').addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });

  // Add event form
  document.getElementById('addEventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const color = document.querySelector('.color-dot.active')?.dataset.color || '#5e6ad2';

    if (addEvent(name, date, color)) {
      hideModal('addEventModal');
    }
  });

  // Delete countdown
  document.getElementById('countdownsList').addEventListener('click', (e) => {
    const btn = e.target.closest('.card-delete');
    if (!btn) return;
    deleteTargetId = btn.dataset.id;
    showModal('deleteModal');
  });

  // Confirm delete
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (deleteTargetId) {
      deleteEvent(deleteTargetId);
      deleteTargetId = null;
    }
    hideModal('deleteModal');
  });

  // Premium
  document.getElementById('premiumBtn').addEventListener('click', unlockPremium);

  // Theme picker
  document.getElementById('themeGrid').addEventListener('click', (e) => {
    const option = e.target.closest('.theme-option');
    if (!option) return;

    if (option.dataset.locked === 'true') {
      showToast('Upgrade to Premium to unlock this theme!');
      return;
    }

    setTheme(option.dataset.theme);
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = {
      events,
      theme: currentTheme,
      premium: isPremium,
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!');
  });

  // Import
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.events && Array.isArray(data.events)) {
          events = data.events;
          saveEvents();
          if (data.theme) setTheme(data.theme);
          renderCountdowns();
          showToast('Data imported!');
        } else {
          showToast('Invalid backup file');
        }
      } catch {
        showToast('Failed to import data');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Notifications
  document.getElementById('notifyBtn').addEventListener('click', async () => {
    if (!('Notification' in window)) {
      showToast('Notifications not supported');
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      showToast('Reminders enabled!');
    } else {
      showToast('Permission denied');
    }
  });

  // Refresh every minute
  setInterval(() => {
    initYearProgress();
    renderCountdowns();
  }, 60000);
}

// ===== Toast Notification =====
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-elevated);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--border);
    z-index: 300;
    animation: fade-in 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    text-align: center;
    max-width: 80vw;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ===== Utilities =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Service Worker Registration =====
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  }
}
