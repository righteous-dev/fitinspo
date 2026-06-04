import { S, save } from '../state.js';
import { toast } from './toast.js';

export function addAlert(btn, name, brand, price, emoji) {
  if (S.alerts.find(a => a.name === name)) { toast('Alert already set!'); return; }
  S.alerts.push({ id: Date.now(), name, brand, price, emoji });
  btn.classList.add('on');
  save();
  updateAlertBadge();
  toast(`🔔 Price alert set for ${name}`);
}

export function removeAlert(id) {
  S.alerts = S.alerts.filter(a => a.id !== id);
  save();
  updateAlertBadge();
  renderAlerts();
  toast('Alert removed');
}

export function updateAlertBadge() {
  const badge = document.getElementById('alertBadge');
  if (S.alerts.length > 0) {
    badge.textContent = S.alerts.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

export function renderAlerts() {
  document.getElementById('alertCount').textContent = S.alerts.length + ' active';
  const list = document.getElementById('alertsList');
  if (!S.alerts.length) {
    list.innerHTML = `<div class="empty-state"><i class="ti ti-bell-off"></i><p>No price alerts yet.<br>Hit the 🔔 on any item while browsing looks.</p></div>`;
    return;
  }
  list.innerHTML = S.alerts.map(a => `
    <div class="alert-card">
      <div class="alert-icon">${a.emoji}</div>
      <div class="alert-info">
        <div class="alert-name">${a.name}</div>
        <div class="alert-meta">${a.brand} · ${a.price}</div>
      </div>
      <div class="watching-badge">Watching</div>
      <div class="del-btn" data-id="${a.id}"><i class="ti ti-trash"></i></div>
    </div>
  `).join('');

  list.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => removeAlert(Number(btn.dataset.id)));
  });
}
