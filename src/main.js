import { appConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  initPortal();
});

function initPortal() {
  // Populate File Metadata
  const fileNameEl = document.getElementById('display-file-name');
  const fileSizeEl = document.getElementById('display-file-size');
  
  if (fileNameEl) fileNameEl.textContent = appConfig.fileName;
  if (fileSizeEl) fileSizeEl.innerHTML = `<strong>${appConfig.fileSize}</strong>`;

  // Render Pre-installed Stack Components
  renderComponents();

  // Render Mirrors
  renderMirrors();

  // Primary Download Button Setup
  const primaryBtn = document.getElementById('primary-download-btn');
  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      triggerDownload(appConfig.downloadUrl, appConfig.fileName);
    });
  }

  // Copy buttons
  setupCopyButtons();
}

function renderComponents() {
  const container = document.getElementById('components-list');
  if (!container) return;

  container.innerHTML = appConfig.hdpComponents.map(comp => `
    <div class="component-pill">
      <span class="component-name">${comp.name}</span>
      <span class="component-version">v${comp.version}</span>
    </div>
  `).join('');
}

function renderMirrors() {
  const container = document.getElementById('mirrors-container');
  if (!container) return;

  container.innerHTML = appConfig.mirrors.map((mirror, idx) => `
    <div class="mirror-card">
      <div class="mirror-info">
        <div class="mirror-icon">☁️</div>
        <div>
          <div class="mirror-title">${mirror.name}</div>
          <div class="mirror-meta">${mirror.speed}</div>
        </div>
      </div>
      <button class="btn btn-outline mirror-download-btn" data-url="${mirror.url}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Mirror ${idx + 1}
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.mirror-download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.getAttribute('data-url');
      triggerDownload(url, appConfig.fileName);
    });
  });
}

function triggerDownload(url, filename) {
  if (!url || url.includes('YOUR_FILE_ID') || url.includes('your-bucket')) {
    showToast('⚠️ Please update the download link in src/config.js with your cloud storage URL!');
    return;
  }
  
  showToast('🚀 Download starting...');

  let downloadTarget = url;
  if (downloadTarget.includes('loca.lt') && !downloadTarget.includes('bypass-tunnel-reminder')) {
    downloadTarget += (downloadTarget.includes('?') ? '&' : '?') + 'bypass-tunnel-reminder=true';
  }

  const a = document.createElement('a');
  a.href = downloadTarget;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.download = filename || 'HDP_2.6.5_virtualbox_180626.ova';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const textToCopy = e.currentTarget.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`📋 Copied: ${textToCopy}`);
        }).catch(() => {
          showToast('Failed to copy text');
        });
      }
    });
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
