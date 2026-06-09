const KEY = {
  boards:   'fitinspo_boards',
  alerts:   'fitinspo_alerts',
  gen:      'fitinspo_gen',
  ageRange: 'fitinspo_age',
  zipCode:  'fitinspo_zip',
  skinTone: 'fitinspo_skin',
  bodyType: 'fitinspo_body',
  gender:   'fitinspo_gender',
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
}

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

// Retailers by gender — injected into the Claude system prompt
export const RETAILERS = {
  woman: [
    'ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Revolve', 'Nordstrom',
    'Mango', 'Free People', '& Other Stories', 'COS', 'Uniqlo',
    'Princess Polly', 'Abercrombie', 'PrettyLittleThing', 'Boohoo',
  ],
  man: [
    'ASOS Men', 'Zara Man', 'H&M Men', 'Urban Outfitters Men', 'Nordstrom Men',
    'Uniqlo', 'Abercrombie Men', 'Nike', 'Adidas', 'Carhartt',
    'Pull&Bear', 'River Island Men', 'Next Men', 'Represent', 'COS Men',
  ],
  nonbinary: [
    'ASOS', 'Zara', 'H&M', 'Urban Outfitters', 'Nordstrom', 'COS',
    'Uniqlo', 'Weekday', 'Arket', 'Abercrombie', 'Collusion',
    'Nike', 'Carhartt', 'Pull&Bear', '& Other Stories',
  ],
};
