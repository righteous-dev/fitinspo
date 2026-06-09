const KEY = {
  boards:   'fitinspo_boards',
  alerts:   'fitinspo_alerts',
  gen:      'fitinspo_gen',
  ageRange: 'fitinspo_age',
  zipCode:  'fitinspo_zip',
  skinTone: 'fitinspo_skin',
  bodyType: 'fitinspo_body',
  gender:   'fitinspo_gender',
  budget:   'fitinspo_budget',
  theme:    'fitinspo_theme',
  fontSize: 'fitinspo_fontsize',
};

const DEFAULT_BOARDS = [
  { id: 1, name: 'Summer Vibes', icon: '☀️', outfits: [] },
  { id: 2, name: 'Work Fits',    icon: '💼', outfits: [] },
];

export const S = {
  boards:   JSON.parse(localStorage.getItem(KEY.boards) || JSON.stringify(DEFAULT_BOARDS)),
  alerts:   JSON.parse(localStorage.getItem(KEY.alerts) || '[]'),
  totalGen: parseInt(localStorage.getItem(KEY.gen) || '0'),
  ageRange: localStorage.getItem(KEY.ageRange) || '26–35',
  zipCode:  localStorage.getItem(KEY.zipCode)  || '',
  skinTone: localStorage.getItem(KEY.skinTone) || '',
  bodyType: localStorage.getItem(KEY.bodyType) || '',
  gender:   localStorage.getItem(KEY.gender)   || 'woman',
  budget:   localStorage.getItem(KEY.budget)   || 'any',
  theme:    localStorage.getItem(KEY.theme)    || 'dark',
  fontSize: localStorage.getItem(KEY.fontSize) || 'normal',
};

export function save() {
  localStorage.setItem(KEY.boards,   JSON.stringify(S.boards));
  localStorage.setItem(KEY.alerts,   JSON.stringify(S.alerts));
  localStorage.setItem(KEY.gen,      String(S.totalGen));
  localStorage.setItem(KEY.ageRange, S.ageRange);
  localStorage.setItem(KEY.zipCode,  S.zipCode);
  localStorage.setItem(KEY.skinTone, S.skinTone);
  localStorage.setItem(KEY.bodyType, S.bodyType);
  localStorage.setItem(KEY.gender,   S.gender);
  localStorage.setItem(KEY.budget,   S.budget);
  localStorage.setItem(KEY.theme,    S.theme);
  localStorage.setItem(KEY.fontSize, S.fontSize);
}

// Budget tiers
export const BUDGET_TIERS = [
  { id: 'thrifty',  label: '💸 Under $75',  prompt: 'Total outfit budget is under $75. Every item must be budget-friendly and affordable. Keep individual item prices low, mostly under $25 each.' },
  { id: 'everyday', label: '🛍 $75–$200',   prompt: 'Total outfit budget is $75–$200. Mix affordable and mid-range pieces. Keep individual items mostly under $60.' },
  { id: 'premium',  label: '✨ $200–$400',  prompt: 'Total outfit budget is $200–$400. Mix mid-range and some premium pieces. Individual items can go up to $120.' },
  { id: 'luxury',   label: '💎 $400+',      prompt: 'This is a luxury outfit — no strict budget. Use premium and designer-adjacent pieces. Quality over price.' },
  { id: 'any',      label: '🔓 No limit',   prompt: '' },
];

// Gender options
export const GENDERS = [
  { id: 'woman',    label: 'Woman',      icon: '♀', modelWord: 'woman',  pronouns: 'her'  },
  { id: 'man',      label: 'Man',        icon: '♂', modelWord: 'man',    pronouns: 'his'  },
  { id: 'nonbinary',label: 'Non-binary', icon: '⚧', modelWord: 'person', pronouns: 'their'},
];

// Skin tones — Fitzpatrick-inspired, described for Flux image generation
export const SKIN_TONES = [
  { id: 'fair',   label: 'Fair',        color: '#fce0d0', prompt: 'fair, porcelain skin tone' },
  { id: 'light',  label: 'Light',       color: '#f5c5a3', prompt: 'light skin tone' },
  { id: 'medium', label: 'Medium',      color: '#e8a87c', prompt: 'medium, warm skin tone' },
  { id: 'tan',    label: 'Tan / Olive', color: '#c68642', prompt: 'tan, olive skin tone' },
  { id: 'brown',  label: 'Brown',       color: '#8d5524', prompt: 'medium brown skin tone' },
  { id: 'deep',   label: 'Deep',        color: '#4a2912', prompt: 'deep, rich brown skin tone' },
];

// Body types — differ by gender
export const BODY_TYPES_WOMAN = [
  { id: 'petite',   label: 'Petite',    prompt: 'petite, slim figure' },
  { id: 'slim',     label: 'Slim',      prompt: 'slim, slender figure' },
  { id: 'athletic', label: 'Athletic',  prompt: 'athletic, toned figure' },
  { id: 'average',  label: 'Average',   prompt: 'average build' },
  { id: 'curvy',    label: 'Curvy',     prompt: 'curvy, hourglass figure' },
  { id: 'plus',     label: 'Plus Size', prompt: 'plus-size, full-figured body' },
];

export const BODY_TYPES_MAN = [
  { id: 'slim',     label: 'Slim',      prompt: 'slim, lean build' },
  { id: 'athletic', label: 'Athletic',  prompt: 'athletic, muscular build' },
  { id: 'regular',  label: 'Regular',   prompt: 'regular, average build' },
  { id: 'broad',    label: 'Broad',     prompt: 'broad-shouldered, stocky build' },
  { id: 'tall',     label: 'Tall',      prompt: 'tall, long-limbed build' },
  { id: 'plus',     label: 'Plus Size', prompt: 'plus-size, heavyset build' },
];

export const BODY_TYPES_NB = [
  { id: 'petite',   label: 'Petite',    prompt: 'petite, slim figure' },
  { id: 'slim',     label: 'Slim',      prompt: 'slim, slender figure' },
  { id: 'athletic', label: 'Athletic',  prompt: 'athletic, toned figure' },
  { id: 'average',  label: 'Average',   prompt: 'average build' },
  { id: 'curvy',    label: 'Curvy',     prompt: 'curvy figure' },
  { id: 'broad',    label: 'Broad',     prompt: 'broad-shouldered build' },
  { id: 'plus',     label: 'Plus Size', prompt: 'plus-size body' },
];

export function getBodyTypes(gender) {
  if (gender === 'man')       return BODY_TYPES_MAN;
  if (gender === 'nonbinary') return BODY_TYPES_NB;
  return BODY_TYPES_WOMAN;
}

// Retailers by gender × age — injected into the Claude system prompt
export const RETAILERS = {
  woman: {
    '15–25': ['ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Princess Polly', 'PrettyLittleThing', 'Boohoo', 'Revolve', 'Abercrombie', 'Free People', 'Mango', 'Uniqlo'],
    '26–35': ['ASOS', 'Zara', 'H&M', 'Revolve', 'Nordstrom', 'Mango', 'Free People', '& Other Stories', 'COS', 'Uniqlo', 'Abercrombie', 'Anthropologie'],
    '36–45': ['Nordstrom', 'Zara', 'Mango', '& Other Stories', 'COS', 'Uniqlo', 'Banana Republic', 'J.Crew', 'Reiss', 'Anthropologie', 'Club Monaco', 'Arket'],
    '46–55': ['Nordstrom', 'COS', 'Uniqlo', 'Banana Republic', 'J.Crew', 'Reiss', 'M&S', 'Hobbs', 'Ann Taylor', 'Talbots', 'Arket', 'Boden'],
    '56–70': ['Nordstrom', 'M&S', 'Hobbs', 'Eileen Fisher', 'Ann Taylor', 'Talbots', 'Boden', 'White House Black Market', 'J.Crew', 'Banana Republic', 'COS', 'Uniqlo'],
  },
  man: {
    '15–25': ['ASOS Men', 'H&M Men', 'Urban Outfitters Men', 'Zara Man', 'Pull&Bear', 'Nike', 'Adidas', 'Carhartt', 'Abercrombie Men', 'Represent', 'River Island Men'],
    '26–35': ['ASOS Men', 'Zara Man', 'H&M Men', 'Nordstrom Men', 'Uniqlo', 'Abercrombie Men', 'Nike', 'Adidas', 'COS Men', 'Next Men', 'Reiss Men'],
    '36–45': ['Nordstrom Men', 'Zara Man', 'COS Men', 'Uniqlo', 'Reiss Men', 'Banana Republic Men', 'J.Crew Men', 'Club Monaco Men', 'Ted Baker', 'Next Men'],
    '46–55': ['Nordstrom Men', 'Uniqlo', 'Banana Republic Men', 'J.Crew Men', 'Reiss Men', 'Ted Baker', 'M&S Men', 'Next Men', 'Brooks Brothers', 'COS Men'],
    '56–70': ['Nordstrom Men', 'M&S Men', 'Uniqlo', 'Banana Republic Men', 'J.Crew Men', 'Brooks Brothers', 'Boden Men', 'Ted Baker', 'Next Men', 'Marks & Spencer Men'],
  },
  nonbinary: {
    '15–25': ['ASOS', 'Urban Outfitters', 'H&M', 'Zara', 'Weekday', 'Collusion', 'Arket', 'Pull&Bear', 'Nike', 'Carhartt', 'COS'],
    '26–35': ['ASOS', 'COS', 'Uniqlo', 'Arket', 'Weekday', 'Zara', 'H&M', 'Nordstrom', 'Nike', '& Other Stories', 'Abercrombie'],
    '36–45': ['COS', 'Uniqlo', 'Arket', 'Nordstrom', 'Banana Republic', 'J.Crew', 'Weekday', '& Other Stories', 'Club Monaco', 'Reiss'],
    '46–55': ['COS', 'Uniqlo', 'Nordstrom', 'Banana Republic', 'J.Crew', 'Arket', 'M&S', 'Reiss', 'Boden', 'Ann Taylor'],
    '56–70': ['Nordstrom', 'COS', 'Uniqlo', 'M&S', 'Banana Republic', 'J.Crew', 'Boden', 'Eileen Fisher', 'Arket', 'Ann Taylor'],
  },
};

export function getRetailers(gender, ageRange) {
  const byGender = RETAILERS[gender] || RETAILERS.woman;
  return byGender[ageRange] || byGender['26–35'];
}
