import { addAlert } from './alerts.js';
import { saveToBoard } from './boards.js';
import { toast } from './toast.js';

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
              <div class="alert-btn" data-name="${escH(item.name)}" data-brand="${escH(item.brand)}" data-price="${escH(item.price)}" data-emoji="${item.emoji || '🛍'}" title="Set price alert">
                <i class="ti ti-bell"></i>
              </div>
              <a class="shop-btn" href="${escH(item.searchUrl)}" target="_blank" rel="noopener">Shop <i class="ti ti-arrow-up-right" style="font-size:10px"></i></a>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="card-foot">
        <div class="total">Est. total <strong>${escH(outfit.totalEstimate)}</strong></div>
        <div class="foot-btns">
          <div class="ico-btn save-btn" data-vibe="${escH(outfit.vibe)}" data-price="${escH(outfit.totalEstimate)}" title="Save to board"><i class="ti ti-bookmark"></i></div>
          <div class="ico-btn share-btn" data-vibe="${escH(outfit.vibe)}" title="Copy link"><i class="ti ti-share"></i></div>
        </div>
      </div>
    `;

    card.querySelectorAll('.alert-btn').forEach(btn => {
      btn.addEventListener('click', () => addAlert(btn, btn.dataset.name, btn.dataset.brand, btn.dataset.price, btn.dataset.emoji));
    });

    card.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', () => saveToBoard(btn, btn.dataset.vibe, btn.dataset.price));
    });

    card.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = `Check out this ${btn.dataset.vibe} outfit from FIT.INSPO! 🔥`;
        navigator.clipboard?.writeText(text);
        btn.classList.add('on');
        toast('✓ Copied to clipboard!');
      });
    });

    stack.appendChild(card);
  });
}
