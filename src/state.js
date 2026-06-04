const KEY = {
  boards: 'fitinspo_boards',
  alerts: 'fitinspo_alerts',
  gen: 'fitinspo_gen',
  ageRange: 'fitinspo_age',
  zipCode: 'fitinspo_zip',
  skinTone: 'fitinspo_skin',
  bodyType: 'fitinspo_body',
};

const DEFAULT_BOARDS = [
  { id: 1, name: 'Summer Vibes', icon: '☀️', outfits: [] },
  { id: 2, name: 'Work Fits', icon: '💼', outfits: [] },
];

export const S = {
  boards: JSON.parse(localStorage.getItem(KEY.boards) || JSON.stringify(DEFAULT_BOARDS)),
  alerts: JSON.parse(localStorage.getItem(KEY.alerts) || '[]'),
  totalGen: parseInt(localStorage.getItem(KEY.gen) || '0'),
  ageRange: localStorage.getItem(KEY.ageRange) || '26–35',
  zipCode: localStorage.getItem(KEY.zipCode) || '',
  skinTone: localStorage.getItem(KEY.skinTone) || '',   // empty = no preference (model decides)
  bodyType: localStorage.getItem(KEY.bodyType) || '',   // empty = no preference
};

export function save() {
  localStorage.setItem(KEY.boards, JSON.stringify(S.boards));
  localStorage.setItem(KEY.alerts, JSON.stringify(S.alerts));
  localStorage.setItem(KEY.gen, String(S.totalGen));
  localStorage.setItem(KEY.ageRange, S.ageRange);
  localStorage.setItem(KEY.zipCode, S.zipCode);
  localStorage.setItem(KEY.skinTone, S.skinTone);
  localStorage.setItem(KEY.bodyType, S.bodyType);
}

// Skin tones — Fitzpatrick-inspired, described for Flux image generation
export const SKIN_TONES = [
  { id: 'fair',   label: 'Fair',         color: '#fce0d0', prompt: 'fair, porcelain skin tone' },
  { id: 'light',  label: 'Light',        color: '#f5c5a3', prompt: 'light skin tone' },
  { id: 'medium', label: 'Medium',       color: '#e8a87c', prompt: 'medium, warm skin tone' },
  { id: 'tan',    label: 'Tan / Olive',  color: '#c68642', prompt: 'tan, olive skin tone' },
  { id: 'brown',  label: 'Brown',        color: '#8d5524', prompt: 'medium brown skin tone' },
  { id: 'deep',   label: 'Deep',         color: '#4a2912', prompt: 'deep, rich brown skin tone' },
];

// Body types — inclusive, body-positive labels
export const BODY_TYPES = [
  { id: 'petite',   label: 'Petite',    prompt: 'petite, slim figure' },
  { id: 'slim',     label: 'Slim',      prompt: 'slim, slender figure' },
  { id: 'athletic', label: 'Athletic',  prompt: 'athletic, toned figure' },
  { id: 'average',  label: 'Average',   prompt: 'average, standard build' },
  { id: 'curvy',    label: 'Curvy',     prompt: 'curvy, hourglass figure' },
  { id: 'plus',     label: 'Plus Size', prompt: 'plus-size, full-figured body' },
];
