import './style.css';
import { S } from './state.js';
import { generateOutfits } from './api.js';
import { renderBoards, createBoard } from './ui/boards.js';
import { renderAlerts, updateAlertBadge } from './ui/alerts.js';
import { renderOutfits } from './ui/outfits.js';
import { toast } from './ui/toast.js';

// ── NAVIGATION ──────────────────────────────────────────────────────────────
window.goTab = function(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'boards') renderBoards();
  if (tab === 'alerts') renderAlerts();
  if (tab === 'profile') updateStats();
};

// ── QUICK CHIPS ─────────────────────────────────────────────────────────────
const CHIPS = [
  ['☀️ Summer Night Out', 'cute going out look for summer'],
  ['✨ Y2K', 'Y2K streetwear look'],
  ['💼 Office Fit', 'clean minimalist office fit 2025'],
  ['🌊 Coastal', 'coastal summer aesthetic outfit'],
  ['🖤 Dark Academia', 'dark academia fall layers'],
  ['💅 Mob Wife', 'mob wife glam going out'],
  ['🌸 Soft Girl', 'soft girl aesthetic pastel'],
];

const chipBar = document.getElementById('chipBar');
CHIPS.forEach(([label, prompt]) => {
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.textContent = label;
  chip.addEventListener('click', () => {
    document.getElementById('promptIn').value = prompt;
    document.getElementById('promptIn').focus();
  });
  chipBar.appendChild(chip);
});

// ── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
document.getElementById('imgInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('previewImg');
    img.src = ev.target.result;
    img.style.display = 'block';
    document.getElementById('promptIn').value = 'Identify this outfit style and find similar items available right now from current retailers';
    toast('📸 Photo ready — hit Generate!');
  };
  reader.readAsDataURL(file);
});

// ── GENERATE ─────────────────────────────────────────────────────────────────
const LOAD_STEPS = [
  'Analyzing 2025 fashion trends...',
  'Searching ASOS, Zara, H&M...',
  'Checking Urban Outfitters, Revolve...',
  'Scanning Nordstrom, Mango, COS...',
  'Styling your complete looks...',
];

async function generate() {
  const prompt = document.getElementById('promptIn').value.trim();
  if (!prompt) { toast('Describe your vibe first!'); return; }

  const btn = document.getElementById('genBtn');
  btn.disabled = true;
  document.getElementById('errBanner').classList.remove('show');
  document.getElementById('resultsArea').style.display = 'none';
  document.getElementById('loader').classList.add('show');
  document.getElementById('trendNote').classList.remove('show');

  let si = 0;
  const stepTimer = setInterval(() => {
    si = (si + 1) % LOAD_STEPS.length;
    document.getElementById('loadStep').textContent = LOAD_STEPS[si];
  }, 1600);

  try {
    const result = await generateOutfits(prompt);

    clearInterval(stepTimer);
    document.getElementById('loader').classList.remove('show');

    S.totalGen += result.outfits.length;
    // save() called lazily; totalGen is low-stakes

    if (result.trendNote) {
      const tn = document.getElementById('trendNote');
      tn.textContent = '✦ ' + result.trendNote;
      tn.classList.add('show');
    }

    renderOutfits(result.outfits);
    document.getElementById('resultsArea').style.display = 'block';
    document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    clearInterval(stepTimer);
    document.getElementById('loader').classList.remove('show');
    const eb = document.getElementById('errBanner');
    eb.textContent = '⚠️ ' + (err.message || 'Something went wrong. Try again.');
    eb.classList.add('show');
  }

  btn.disabled = false;
}

document.getElementById('genBtn').addEventListener('click', generate);
document.getElementById('promptIn').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }
});

// ── BOARDS BUTTON ────────────────────────────────────────────────────────────
document.getElementById('newBoardBtn').addEventListener('click', createBoard);

// ── PROFILE STATS ─────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('statGen').textContent = S.totalGen;
  document.getElementById('statBoards').textContent = S.boards.length;
  document.getElementById('statAlerts').textContent = S.alerts.length;
}

// ── INIT ─────────────────────────────────────────────────────────────────────
renderBoards();
renderAlerts();
updateAlertBadge();
updateStats();
