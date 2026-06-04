import { S, save } from '../state.js';
import { toast } from './toast.js';

export function renderBoards() {
  const grid = document.getElementById('boardGrid');
  if (!S.boards.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:span 2"><i class="ti ti-layout-grid"></i><p>No boards yet.<br>Create one to start saving looks!</p></div>`;
    return;
  }
  grid.innerHTML = S.boards.map(b => `
    <div class="board-card">
      <div class="board-icon">${b.icon}</div>
      <div class="board-name">${b.name}</div>
      <div class="board-count">${b.outfits.length} outfit${b.outfits.length !== 1 ? 's' : ''}</div>
      ${b.outfits.length ? `<div class="preview-chips">${b.outfits.slice(0, 3).map(o => `<span class="pc">${o.name.slice(0, 14)}${o.name.length > 14 ? '…' : ''}</span>`).join('')}</div>` : ''}
    </div>
  `).join('');
}

export function saveToBoard(btn, outfitName, price) {
  if (!S.boards.length) { toast('Create a board first!'); return; }
  const board = S.boards[0];
  if (board.outfits.find(o => o.name === outfitName)) { toast('Already saved!'); return; }
  board.outfits.push({ name: outfitName, price });
  btn.classList.add('on');
  save();
  toast(`✓ Saved to "${board.name}"`);
}

export function createBoard() {
  const name = prompt('Board name?');
  if (!name?.trim()) return;
  const icons = ['✨', '🖤', '🌸', '🔥', '💫', '🌿', '👑', '🌊', '💎', '🎀'];
  S.boards.push({ id: Date.now(), name: name.trim(), icon: icons[Math.floor(Math.random() * icons.length)], outfits: [] });
  save();
  renderBoards();
  toast(`✓ Board "${name.trim()}" created`);
}
