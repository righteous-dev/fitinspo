import { addAlert } from './alerts.js';
import { saveToBoard } from './boards.js';
import { toast } from './toast.js';
import { generateImage } from '../api.js';
import { openStoreSheet } from '../main.js';
import { S, SKIN_TONES, BODY_TYPES } from '../state.js';

function escH(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderOutfits(outfits) {
  const stack = document.getElementById('outfitStack');
  stack.innerHTML = '';

  outfits.forEach(outfit => {
    const card = document.createElement('div');
    card.className = 'outfit-card';
    card.innerHTML = `
      <div class="card-head">
        <div class="card-vibe">${escH(outfit.vibe)}</div>
        <div class="card-tags">${(outfit.tags || []).map(t => `<span class="vtag">${escH(t)}</span>`).join('')}</div>
      </div>

      <div class="outfit-image-wrap">
        <div class="outfit-img-shimmer" id="shimmer-${outfit._id}">
          <div class="shimmer-inner"></div>
          <div class="shimmer-label">Generating look…</div>
        </div>
        <img class="outfit-img" id="img-${outfit._id}" style="display:none" alt="${escH(outfit.vibe)} outfit">
        <div class="img-error" id="imgerr-${outfit._id}" style="display:none">
          <i class="ti ti-photo-off"></i><span>Image unavailable</span>
        </div>
      </div>

      <div class="color-palette-row" id="palette-${outfit._id}">
        ${(outfit.colorPalettes || []).map((p, i) => `
          <button class="palette-chip ${i === 0 ? 'active' : ''}"
            data-label="${escH(p.label)}"
            data-colors="${escH(p.colors)}"
            data-outfit-id="${outfit._id}">
            ${escH(p.label)}
          </button>
        `).join('')}
      </div>

      <div class="card-desc">${escH(outfit.description)}</div>
      <div class="items-list">
        ${(outfit.items || []).map((item, ii) => `
          <div class="item-row">
            <div class="item-num">${String(ii + 1).padStart(2, '0')}</div>
            <div class="item-info">
              <div class="item-name">${item.emoji || '🛍'} ${escH(item.name)}</div>
              <div class="item-meta">${escH(item.brand)} · ${escH(item.category)}</div>
            </div>
            <div class="item-right">
              <span class="item-price">${escH(item.price)}</span>
              <div class="alert-btn"
                data-name="${escH(item.name)}" data-brand="${escH(item.brand)}"
                data-price="${escH(item.price)}" data-emoji="${item.emoji || '🛍'}"
                title="Set price alert">
                <i class="ti ti-bell"></i>
              </div>
              <div class="store-btn"
                data-brand="${escH(item.brand)}" data-item="${escH(item.name)}"
                title="Find in nearby stores">
                <i class="ti ti-map-pin"></i>
              </div>
              <a class="shop-btn" href="${escH(item.searchUrl)}" target="_blank" rel="noopener">
                Shop <i class="ti ti-arrow-up-right" style="font-size:10px"></i>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="card-foot">
        <div class="total">Est. total <strong>${escH(outfit.totalEstimate)}</strong></div>
        <div class="foot-btns">
          <div class="ico-btn save-btn" data-vibe="${escH(outfit.vibe)}" data-price="${escH(outfit.totalEstimate)}" title="Save to board">
            <i class="ti ti-bookmark"></i>
          </div>
          <div class="ico-btn share-btn" data-vibe="${escH(outfit.vibe)}" title="Copy link">
            <i class="ti ti-share"></i>
          </div>
        </div>
      </div>
    `;

    // Wire alert buttons
    card.querySelectorAll('.alert-btn').forEach(btn => {
      btn.addEventListener('click', () => addAlert(btn, btn.dataset.name, btn.dataset.brand, btn.dataset.price, btn.dataset.emoji));
    });

    // Wire store finder buttons
    card.querySelectorAll('.store-btn').forEach(btn => {
      btn.addEventListener('click', () => openStoreSheet(btn.dataset.brand, btn.dataset.item));
    });

    // Wire save/share buttons
    card.querySelector('.save-btn').addEventListener('click', function () {
      saveToBoard(this, this.dataset.vibe, this.dataset.price);
    });
    card.querySelector('.share-btn').addEventListener('click', function () {
      navigator.clipboard?.writeText(`Check out this ${this.dataset.vibe} outfit from FIT.INSPO! 🔥`);
      this.classList.add('on');
      toast('✓ Copied to clipboard!');
    });

    // Wire color palette chips
    card.querySelectorAll('.palette-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        card.querySelectorAll('.palette-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const colors = chip.dataset.label === 'Original' ? null : chip.dataset.colors;
        loadImage(outfit, colors);
      });
    });

    stack.appendChild(card);

    // Kick off initial image generation
    loadImage(outfit, null);
  });
}

function loadImage(outfit, colors) {
  const shimmer = document.getElementById(`shimmer-${outfit._id}`);
  const img = document.getElementById(`img-${outfit._id}`);
  const err = document.getElementById(`imgerr-${outfit._id}`);
  const chips = document.querySelectorAll(`#palette-${outfit._id} .palette-chip`);

  shimmer.style.display = 'flex';
  img.style.display = 'none';
  err.style.display = 'none';
  chips.forEach(c => c.disabled = true);

  const skinPrompt = SKIN_TONES.find(t => t.id === S.skinTone)?.prompt || null;
  const bodyPrompt = BODY_TYPES.find(t => t.id === S.bodyType)?.prompt || null;

  generateImage(outfit.imagePrompt, colors, skinPrompt, bodyPrompt)
    .then(base64 => {
      img.src = `data:image/jpeg;base64,${base64}`;
      img.onload = () => {
        shimmer.style.display = 'none';
        img.style.display = 'block';
        chips.forEach(c => c.disabled = false);
      };
    })
    .catch(() => {
      shimmer.style.display = 'none';
      err.style.display = 'flex';
      chips.forEach(c => c.disabled = false);
    });
}
