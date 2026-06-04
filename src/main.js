import './style.css';
import { S, save, SKIN_TONES, BODY_TYPES } from './state.js';
import { generateOutfits } from './api.js';
import { renderBoards, createBoard } from './ui/boards.js';
import { renderAlerts, updateAlertBadge } from './ui/alerts.js';
import { renderOutfits } from './ui/outfits.js';
import { toast } from './ui/toast.js';

// ── AGE RANGES ───────────────────────────────────────────────────────────────
const AGE_RANGES = ['15–25', '26–35', '36–45', '46–55', '56–70'];

// Age chips on generate page
const ageChipsEl = document.getElementById('ageChips');
AGE_RANGES.forEach(range => {
  const btn = document.createElement('button');
  btn.className = 'age-chip' + (S.ageRange === range ? ' active' : '');
  btn.textContent = range;
  btn.addEventListener('click', () => {
    S.ageRange = range;
    save();
    ageChipsEl.querySelectorAll('.age-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    refreshChips();
  });
  ageChipsEl.appendChild(btn);
});

// Age range grid on profile page
const ageRangeGrid = document.getElementById('ageRangeGrid');
AGE_RANGES.forEach(range => {
  const btn = document.createElement('button');
  btn.className = 'age-range-btn' + (S.ageRange === range ? ' active' : '');
  btn.textContent = range;
  btn.addEventListener('click', () => {
    S.ageRange = range;
    save();
    ageRangeGrid.querySelectorAll('.age-range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // sync generate page chips
    ageChipsEl.querySelectorAll('.age-chip').forEach(c => {
      c.classList.toggle('active', c.textContent === range);
    });
    refreshChips();
    toast(`✓ Styling for ages ${range}`);
  });
  ageRangeGrid.appendChild(btn);
});

// ── CHIP SETS PER AGE GROUP ──────────────────────────────────────────────────
const CHIPS_BY_AGE = {
  '15–25': [
    ['☀️ Summer Night Out', 'cute going out look for summer'],
    ['✨ Y2K', 'Y2K streetwear look'],
    ['🌊 Coastal', 'coastal summer aesthetic outfit'],
    ['🖤 Dark Academia', 'dark academia fall layers'],
    ['💅 Mob Wife', 'mob wife glam going out'],
    ['🌸 Soft Girl', 'soft girl aesthetic pastel'],
    ['🔥 Streetwear', 'trendy streetwear fit 2025'],
  ],
  '26–35': [
    ['💼 Office Chic', 'clean minimalist office fit 2025'],
    ['☀️ Weekend Brunch', 'stylish weekend brunch outfit'],
    ['🌿 Smart Casual', 'elevated smart casual everyday look'],
    ['🌊 Coastal', 'coastal resort wear outfit'],
    ['🖤 Evening Out', 'sophisticated evening out look'],
    ['✈️ Travel Style', 'chic airport travel outfit'],
    ['🎉 Cocktail', 'cocktail party outfit 2025'],
  ],
  '36–45': [
    ['💼 Power Dressing', 'powerful sophisticated work outfit'],
    ['🎉 Date Night', 'elegant date night outfit'],
    ['🌿 Weekend Casual', 'stylish relaxed weekend look for 40s'],
    ['✈️ Vacation Ready', 'chic vacation resort outfit'],
    ['🖤 Evening Glam', 'polished evening glamour look'],
    ['☀️ Summer Weekend', 'effortless summer weekend outfit'],
    ['🎨 Creative Office', 'creative professional office outfit'],
  ],
  '46–55': [
    ['💼 Executive Style', 'polished executive professional outfit'],
    ['🌿 Relaxed Luxury', 'relaxed luxury casual look for 50s'],
    ['🎉 Special Occasion', 'elegant special occasion outfit'],
    ['☀️ Resort Wear', 'sophisticated resort vacation outfit'],
    ['🖤 Timeless Classic', 'timeless classic elegant look'],
    ['✈️ City Break', 'stylish city break travel outfit'],
    ['🎨 Cultural Event', 'refined cultural event outfit'],
  ],
  '56–70': [
    ['💼 Refined Classic', 'refined classic elegant outfit for 60s'],
    ['🌿 Easy Elegance', 'easy elegant comfortable stylish look'],
    ['🎉 Celebration', 'celebratory occasion elegant outfit'],
    ['☀️ Warm Weather', 'stylish comfortable warm weather outfit'],
    ['🖤 Sophisticated Evening', 'sophisticated evening out look for 60s'],
    ['🌊 Coastal Relaxed', 'chic relaxed coastal outfit'],
    ['🎨 Arts & Culture', 'stylish arts gallery cultural outing outfit'],
  ],
};

function refreshChips() {
  const chipBar = document.getElementById('chipBar');
  chipBar.innerHTML = '';
  const chips = CHIPS_BY_AGE[S.ageRange] || CHIPS_BY_AGE['26–35'];
  chips.forEach(([label, prompt]) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = label;
    chip.addEventListener('click', () => {
      document.getElementById('promptIn').value = prompt;
      document.getElementById('promptIn').focus();
    });
    chipBar.appendChild(chip);
  });
}

// ── SKIN TONE SWATCHES ────────────────────────────────────────────────────────
const skinSwatches = document.getElementById('skinSwatches');

function updateAvatar() {
  const avatar = document.getElementById('profileAvatar');
  const skin = SKIN_TONES.find(t => t.id === S.skinTone);
  if (skin) {
    avatar.style.background = skin.color;
    avatar.style.borderColor = skin.color;
    avatar.innerHTML = `<i class="ti ti-user" style="font-size:28px;color:rgba(0,0,0,0.4)"></i>`;
  } else {
    avatar.style.background = 'rgba(212,254,1,.1)';
    avatar.style.borderColor = 'rgba(212,254,1,.3)';
    avatar.innerHTML = `<i class="ti ti-user" style="font-size:28px"></i>`;
  }
}

SKIN_TONES.forEach(tone => {
  const swatch = document.createElement('button');
  swatch.className = 'skin-swatch' + (S.skinTone === tone.id ? ' active' : '');
  swatch.style.background = tone.color;
  swatch.title = tone.label;
  swatch.setAttribute('aria-label', tone.label);
  swatch.addEventListener('click', () => {
    // Toggle off if already selected
    S.skinTone = S.skinTone === tone.id ? '' : tone.id;
    save();
    skinSwatches.querySelectorAll('.skin-swatch').forEach(s => s.classList.remove('active'));
    if (S.skinTone) swatch.classList.add('active');
    updateAvatar();
    toast(S.skinTone ? `✓ Skin tone set to ${tone.label}` : 'Skin tone cleared');
  });
  skinSwatches.appendChild(swatch);
});

// ── BODY TYPE CHIPS ───────────────────────────────────────────────────────────
const bodyChipsEl = document.getElementById('bodyChips');

BODY_TYPES.forEach(type => {
  const btn = document.createElement('button');
  btn.className = 'body-chip' + (S.bodyType === type.id ? ' active' : '');
  btn.textContent = type.label;
  btn.addEventListener('click', () => {
    // Toggle off if already selected
    S.bodyType = S.bodyType === type.id ? '' : type.id;
    save();
    bodyChipsEl.querySelectorAll('.body-chip').forEach(b => b.classList.remove('active'));
    if (S.bodyType) btn.classList.add('active');
    toast(S.bodyType ? `✓ Body type set to ${type.label}` : 'Body type cleared');
  });
  bodyChipsEl.appendChild(btn);
});

// ── ZIP CODE ─────────────────────────────────────────────────────────────────
const zipInput = document.getElementById('zipInput');
const zipStatus = document.getElementById('zipStatus');

zipInput.value = S.zipCode;
updateZipStatus();

document.getElementById('zipSaveBtn').addEventListener('click', () => {
  const z = zipInput.value.trim();
  if (z && !/^\d{5}$/.test(z)) {
    zipStatus.textContent = '⚠️ Enter a valid 5-digit US zip code';
    zipStatus.style.color = 'rgba(226,75,74,.8)';
    return;
  }
  S.zipCode = z;
  save();
  updateZipStatus();
  toast(z ? `📍 Zip code ${z} saved` : 'Zip code cleared');
});

function updateZipStatus() {
  if (S.zipCode) {
    zipStatus.textContent = `📍 ${S.zipCode} — tap 📍 on any item to find nearby stores`;
    zipStatus.style.color = 'rgba(212,254,1,.7)';
  } else {
    zipStatus.textContent = '';
  }
}

// ── STORE FINDER SHEET ────────────────────────────────────────────────────────
const storeSheet = document.getElementById('storeSheet');
const storeSheetOverlay = document.getElementById('storeSheetOverlay');
const sheetZipRow = document.getElementById('sheetZipRow');
const sheetStores = document.getElementById('sheetStores');

document.getElementById('storeSheetClose').addEventListener('click', closeStoreSheet);
storeSheetOverlay.addEventListener('click', closeStoreSheet);

export function openStoreSheet(brand, itemName) {
  const zip = S.zipCode;
  sheetZipRow.style.display = zip ? 'none' : 'flex';

  const mapsQuery = zip
    ? `${brand} near ${zip}`
    : `${brand} store`;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(mapsQuery)}`;
  const yelpUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(brand)}&find_loc=${encodeURIComponent(zip || '')}`;

  sheetStores.innerHTML = `
    <div class="sheet-item-name">${itemName}</div>
    <div class="sheet-brand-tag">${brand}</div>
    <div class="store-link-list">
      <a class="store-link" href="${mapsUrl}" target="_blank" rel="noopener">
        <div class="store-link-icon" style="background:rgba(66,133,244,.12);border-color:rgba(66,133,244,.3)">
          <i class="ti ti-map" style="color:#4285f4"></i>
        </div>
        <div class="store-link-info">
          <div class="store-link-title">Google Maps</div>
          <div class="store-link-sub">${zip ? `${brand} stores near ${zip}` : `Find ${brand} stores`}</div>
        </div>
        <i class="ti ti-arrow-up-right" style="color:var(--muted);font-size:14px"></i>
      </a>
      <a class="store-link" href="${yelpUrl}" target="_blank" rel="noopener">
        <div class="store-link-icon" style="background:rgba(196,0,0,.1);border-color:rgba(196,0,0,.25)">
          <i class="ti ti-star" style="color:#c40000"></i>
        </div>
        <div class="store-link-info">
          <div class="store-link-title">Yelp</div>
          <div class="store-link-sub">Reviews &amp; hours for nearby ${brand}</div>
        </div>
        <i class="ti ti-arrow-up-right" style="color:var(--muted);font-size:14px"></i>
      </a>
      <a class="store-link" href="https://www.google.com/search?q=${encodeURIComponent(brand + ' store locator')}" target="_blank" rel="noopener">
        <div class="store-link-icon" style="background:rgba(212,254,1,.08);border-color:rgba(212,254,1,.2)">
          <i class="ti ti-world" style="color:var(--accent)"></i>
        </div>
        <div class="store-link-info">
          <div class="store-link-title">${brand} Store Locator</div>
          <div class="store-link-sub">Official retailer store finder</div>
        </div>
        <i class="ti ti-arrow-up-right" style="color:var(--muted);font-size:14px"></i>
      </a>
    </div>
    ${!zip ? `<div class="sheet-zip-prompt">
      <i class="ti ti-map-pin-2"></i>
      <p>Add your zip in <strong>Profile</strong> for more precise results</p>
    </div>` : ''}
  `;

  storeSheet.classList.add('open');
  storeSheetOverlay.classList.add('open');
}

function closeStoreSheet() {
  storeSheet.classList.remove('open');
  storeSheetOverlay.classList.remove('open');
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
window.goTab = function(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'boards') renderBoards();
  if (tab === 'alerts') renderAlerts();
  if (tab === 'profile') updateStats();
};

// ── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
document.getElementById('imgInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('previewImg');
    img.src = ev.target.result;
    img.style.display = 'block';
    document.getElementById('promptIn').value = 'Identify this outfit style and find similar items from current retailers';
    toast('📸 Photo ready — hit Generate!');
  };
  reader.readAsDataURL(file);
});

// ── GENERATE ──────────────────────────────────────────────────────────────────
const LOAD_STEPS = [
  'Analyzing 2025 trends...',
  'Curating looks for your style...',
  'Searching ASOS, Zara, H&M...',
  'Checking Revolve, Nordstrom...',
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
    const result = await generateOutfits(prompt, S.ageRange);

    clearInterval(stepTimer);
    document.getElementById('loader').classList.remove('show');

    S.totalGen += result.outfits.length;

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

// ── BOARDS BUTTON ─────────────────────────────────────────────────────────────
document.getElementById('newBoardBtn').addEventListener('click', createBoard);

// ── PROFILE STATS ──────────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('statGen').textContent = S.totalGen;
  document.getElementById('statBoards').textContent = S.boards.length;
  document.getElementById('statAlerts').textContent = S.alerts.length;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
refreshChips();
renderBoards();
renderAlerts();
updateAlertBadge();
updateStats();
updateAvatar();
