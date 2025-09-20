// Dictionnaire complet du code Morse
export const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

// Dictionnaire inverse pour le décodage
export const MORSE_TO_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([key, value]) => [value, key])
);

export interface MorseTranslationResult {
  input: string;
  output: string;
  isValid: boolean;
  error?: string;
}

export function textToMorse(text: string): MorseTranslationResult {
  try {
    const upperText = text.toUpperCase();
    const morseChars: string[] = [];
    
    for (const char of upperText) {
      if (char === ' ') {
        morseChars.push('/');
      } else if (MORSE_CODE[char]) {
        morseChars.push(MORSE_CODE[char]);
      } else if (char.trim() !== '') {
        // Caractère non supporté, on l'ignore avec avertissement
        morseChars.push('?');
      }
    }
    
    return {
      input: text,
      output: morseChars.join(' '),
      isValid: true
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      input: text,
      output: '',
      isValid: false,
      error: 'Erreur lors du codage'
    };
  }
}

export function morseToText(morse: string): MorseTranslationResult {
  try {
    const morseWords = morse.split(' / ');
    const textWords: string[] = [];
    
    for (const word of morseWords) {
      const morseChars = word.trim().split(' ');
      const textChars: string[] = [];
      
      for (const morseChar of morseChars) {
        if (morseChar.trim() === '') continue;
        
        if (MORSE_TO_TEXT[morseChar]) {
          textChars.push(MORSE_TO_TEXT[morseChar]);
        } else {
          textChars.push('?');
        }
      }
      textWords.push(textChars.join(''));
    }
    
    return {
      input: morse,
      output: textWords.join(' '),
      isValid: true
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      input: morse,
      output: '',
      isValid: false,
      error: 'Erreur lors du décodage'
    };
  }
}

export function validateMorseInput(input: string): boolean {
  const validChars = /^[.\-\s/]*$/;
  return validChars.test(input);
}

export function generateMorseSequence(morse: string): Array<{type: 'dot' | 'dash' | 'pause', duration: number}> {
  const sequence: Array<{type: 'dot' | 'dash' | 'pause', duration: number}> = [];
  
  for (let i = 0; i < morse.length; i++) {
    const char = morse[i];
    
    if (char === '.') {
      sequence.push({ type: 'dot', duration: 150 });
    } else if (char === '-') {
      sequence.push({ type: 'dash', duration: 450 });
    } else if (char === ' ') {
      sequence.push({ type: 'pause', duration: 300 });
    } else if (char === '/') {
      sequence.push({ type: 'pause', duration: 700 });
    }
    
    // Pause entre les signaux
    if (i < morse.length - 1 && char !== ' ' && char !== '/') {
      sequence.push({ type: 'pause', duration: 150 });
    }
  }
  
  return sequence;
}

// Mots pour le mode entraînement
export const TRAINING_WORDS = [
  // Mots de base
  'SOS', 'HELLO', 'WORLD', 'CODE', 'MORSE', 'RADIO', 'SIGNAL', 'EMERGENCY',
  'SHIP', 'PLANE', 'RESCUE', 'HELP', 'DANGER', 'SAFE', 'MESSAGE', 'SEND',
  'RECEIVE', 'FREQUENCY', 'ANTENNA', 'TELEGRAPH', 'WIRELESS', 'BROADCAST',
  
  // Mots courts
  'CAT', 'DOG', 'BAT', 'HAT', 'RAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT',
  'BED', 'RED', 'LED', 'FED', 'WED', 'NET', 'PET', 'SET', 'GET', 'LET',
  'BIG', 'DIG', 'FIG', 'PIG', 'WIG', 'JIG', 'RIG', 'SIG', 'HIT', 'BIT',
  'FIT', 'KIT', 'PIT', 'SIT', 'WIT', 'LIT', 'MIT', 'TIT', 'HOT', 'POT',
  'COT', 'DOT', 'GOT', 'LOT', 'NOT', 'ROT', 'SOT', 'TOT', 'CUT', 'BUT',
  'HUT', 'NUT', 'PUT', 'RUT', 'GUT', 'JUT', 'TUT', 'MUT',
  
  // Mots moyens
  'APPLE', 'BREAD', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE',
  'IMAGE', 'JUICE', 'KNIFE', 'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PEACE',
  'QUEEN', 'RIVER', 'STONE', 'TIGER', 'UNDER', 'VOICE', 'WATER', 'YOUTH',
  'ZEBRA', 'BEACH', 'CLOUD', 'DREAM', 'EARTH', 'FIELD', 'GLASS', 'HEART',
  'ISLAND', 'JUNGLE', 'KITCHEN', 'LADDER', 'MOUNTAIN', 'NATURE', 'ORANGE',
  'PLANET', 'RABBIT', 'SCHOOL', 'TRAVEL', 'UMBRELLA', 'VALLEY', 'WINDOW',
  
  // Mots longs
  'ADVENTURE', 'BEAUTIFUL', 'CHOCOLATE', 'DANGEROUS', 'EDUCATION', 'FANTASTIC',
  'GEOGRAPHY', 'HAPPINESS', 'IMPORTANT', 'KNOWLEDGE', 'LANDSCAPE', 'MEDICINE',
  'NECESSARY', 'OPERATION', 'PARAGRAPH', 'QUESTIONS', 'RESTAURANT', 'SITUATION',
  'TELEPHONE', 'UNDERSTAND', 'VOCABULARY', 'WONDERFUL', 'YESTERDAY', 'ZOOLOGY',
  
  // Phrases courtes
  'GOOD MORNING', 'THANK YOU', 'HOW ARE YOU', 'SEE YOU LATER', 'HAVE A NICE DAY',
  'WHAT TIME IS IT', 'WHERE ARE YOU', 'I LOVE YOU', 'HAPPY BIRTHDAY', 'GOOD LUCK',
  'WELL DONE', 'BE CAREFUL', 'TAKE CARE', 'GOOD NIGHT', 'EXCUSE ME',
  
  // Mots techniques
  'FREQUENCY', 'AMPLITUDE', 'WAVELENGTH', 'TRANSMISSION', 'RECEPTION', 'MODULATION',
  'OSCILLATOR', 'GENERATOR', 'DETECTOR', 'AMPLIFIER', 'FILTER', 'CIRCUIT',
  'VOLTAGE', 'CURRENT', 'RESISTANCE', 'CAPACITOR', 'INDUCTOR', 'TRANSFORMER'
];

// Mots mnémotechniques pour chaque lettre
export const LETTER_MNEMONICS: Record<string, {
  word: string;
  phrase: string;
  description: string;
}> = {
  'A': { word: 'ALPHA', phrase: 'A-bout', description: 'Point-Trait comme "A-bout"' },
  'B': { word: 'BRAVO', phrase: 'Bou-di-di-dit', description: 'Trait suivi de 3 points' },
  'C': { word: 'CHARLIE', phrase: 'Char-li-Char-lie', description: 'Trait-Point-Trait-Point' },
  'D': { word: 'DELTA', phrase: 'Dou-di-dit', description: 'Trait suivi de 2 points' },
  'E': { word: 'ECHO', phrase: 'Et', description: 'Un seul point, le plus simple' },
  'F': { word: 'FOXTROT', phrase: 'Di-di-Fou-dit', description: '2 points, trait, point' },
  'G': { word: 'GOLF', phrase: 'Gol-gol-dit', description: '2 traits suivis d\'un point' },
  'H': { word: 'HOTEL', phrase: 'Hi-hi-hi-hit', description: '4 points rapides' },
  'I': { word: 'INDIA', phrase: 'I-dit', description: '2 points simples' },
  'J': { word: 'JULIET', phrase: 'Ju-liet-te-te', description: 'Point suivi de 3 traits' },
  'K': { word: 'KILO', phrase: 'Ki-lou-dit', description: 'Trait-Point-Trait' },
  'L': { word: 'LIMA', phrase: 'Li-mou-di-dit', description: 'Point-Trait-2 points' },
  'M': { word: 'MIKE', phrase: 'Mou-mou', description: '2 traits, comme "M"' },
  'N': { word: 'NOVEMBER', phrase: 'Nou-dit', description: 'Trait-Point' },
  'O': { word: 'OSCAR', phrase: 'Os-car-los', description: '3 traits longs' },
  'P': { word: 'PAPA', phrase: 'Pa-pou-pa-dit', description: 'Point-Trait-Trait-Point' },
  'Q': { word: 'QUEBEC', phrase: 'Qué-bec-ou-dit', description: 'Trait-Trait-Point-Trait' },
  'R': { word: 'ROMEO', phrase: 'Ro-mé-o', description: 'Point-Trait-Point' },
  'S': { word: 'SIERRA', phrase: 'Si-si-sit', description: '3 points rapides' },
  'T': { word: 'TANGO', phrase: 'Tou', description: 'Un seul trait' },
  'U': { word: 'UNIFORM', phrase: 'U-ni-fou', description: '2 points suivis d\'un trait' },
  'V': { word: 'VICTOR', phrase: 'Vic-to-riou', description: '3 points suivis d\'un trait' },
  'W': { word: 'WHISKEY', phrase: 'Whi-ske-ey', description: 'Point suivi de 2 traits' },
  'X': { word: 'XRAY', phrase: 'X-ra-ay-dit', description: 'Trait-2 points-Trait' },
  'Y': { word: 'YANKEE', phrase: 'Yan-kee-ee-e', description: 'Trait-Point-2 traits' },
  'Z': { word: 'ZULU', phrase: 'Zu-lu-di-dit', description: '2 traits-2 points' },
  '0': { word: 'ZERO', phrase: 'Ze-ro-ze-ro-ze', description: '5 traits pour zéro' },
  '1': { word: 'ONE', phrase: 'O-ne-ne-ne-ne', description: '1 point, 4 traits' },
  '2': { word: 'TWO', phrase: 'Too-o-o-o-dit', description: '2 points, 3 traits' },
  '3': { word: 'THREE', phrase: 'Th-ree-ee-dit-dit', description: '3 points, 2 traits' },
  '4': { word: 'FOUR', phrase: 'Fo-ur-ur-dit-dit', description: '4 points, 1 trait' },
  '5': { word: 'FIVE', phrase: 'Fi-ve-fi-ve-fi', description: '5 points pour cinq' },
  '6': { word: 'SIX', phrase: 'Si-i-i-i-ix-dit', description: '1 trait, 4 points' },
  '7': { word: 'SEVEN', phrase: 'Se-ven-en-dit-dit', description: '2 traits, 3 points' },
  '8': { word: 'EIGHT', phrase: 'Ei-ght-ght-dit-dit', description: '3 traits, 2 points' },
  '9': { word: 'NINE', phrase: 'Ni-ne-ne-ne-dit', description: '4 traits, 1 point' }
};

export function getRandomWord(): string {
  return TRAINING_WORDS[Math.floor(Math.random() * TRAINING_WORDS.length)];
}