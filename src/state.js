const KEY = {
  boards: 'fitinspo_boards',
  alerts: 'fitinspo_alerts',
  gen: 'fitinspo_gen',
};

const DEFAULT_BOARDS = [
  { id: 1, name: 'Summer Vibes', icon: '☀️', outfits: [] },
  { id: 2, name: 'Work Fits', icon: '💼', outfits: [] },
];

export const S = {
  boards: JSON.parse(localStorage.getItem(KEY.boards) || JSON.stringify(DEFAULT_BOARDS)),
  alerts: JSON.parse(localStorage.getItem(KEY.alerts) || '[]'),
  totalGen: parseInt(localStorage.getItem(KEY.gen) || '0'),
};

export function save() {
  localStorage.setItem(KEY.boards, JSON.stringify(S.boards));
  localStorage.setItem(KEY.alerts, JSON.stringify(S.alerts));
  localStorage.setItem(KEY.gen, String(S.totalGen));
}
