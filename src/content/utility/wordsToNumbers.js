// Lookup tables live at module scope (not just inside wordsToNumber) so
// they can also feed WORD_NUMBER_SOURCE below — the regex fragment other
// converters embed to recognize number words, not just digits.
const UNITS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19
};

const TENS = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
};

const SCALES = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
  billion: 1000000000
};

// Longest-first so the alternation prefers e.g. "seventeen" over the
// shorter "seven" that happens to prefix it.
const NUMBER_WORDS = [...Object.keys(UNITS), ...Object.keys(TENS), ...Object.keys(SCALES)]
  .sort((a, b) => b.length - a.length);

// Regex source (no delimiters/flags) matching a phrase made of one or more
// number words, optionally joined by "and", spaces, or hyphens — e.g.
// "ten", "twenty-five", "one hundred and twenty-three". Meant to be
// embedded inside other regexes (wrapped in its own \b...\b) so unit
// converters can recognize numbers written as words, not just digits.
const WORD_NUMBER_SOURCE = `(?:(?:${NUMBER_WORDS.join("|")}|and)[\\s-]+)*(?:${NUMBER_WORDS.join("|")})`;

function wordsToNumber(text) {
  // Clean up the input string (lowercase, replace hyphens, split into words)
  const words = text
    .toLowerCase()
    .replace(/-/g, ' ') // "twenty-five" -> "twenty five", so hyphenated compounds still split into words
    .replace(/[^a-z\s]/g, '') // Remove remaining punctuation like commas
    .split(/\s+/)
    .filter(word => word !== 'and' && word.trim() !== ''); // Filter out "and" filler words

  let total = 0;
  let currentGroup = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (UNITS[word] !== undefined) {
      currentGroup += UNITS[word];
    } else if (TENS[word] !== undefined) {
      currentGroup += TENS[word];
    } else if (SCALES[word] !== undefined) {
      const scaleValue = SCALES[word];

      if (scaleValue === 100) {
        // "Hundred" multiplies just the current local group (e.g., "three hundred")
        currentGroup *= scaleValue;
      } else {
        // "Thousand", "Million", etc. multiply the current group, lock it into total, and reset
        currentGroup *= scaleValue;
        total += currentGroup;
        currentGroup = 0;
      }
    } else {
      // Ignore or handle invalid number words gracefully
      console.warn(`Unrecognized number word: "${word}"`);
    }
  }

  // Add any remaining trailing values (like the "forty-two" at the end of a large number)
  return total + currentGroup;
}

// Parses a token that may be either a digit-based number (optionally with
// thousands separators, e.g. "1,234.5") or a word-based number (e.g.
// "twenty-five"), returning a plain numeric value either way.
function parseNumberToken(token) {
  const trimmed = token.trim();
  if (/^[\d,]/.test(trimmed)) {
    return parseFloat(trimmed.replace(/,/g, ''));
  }
  return wordsToNumber(trimmed);
}

export default wordsToNumber;
export {
  parseNumberToken,
  WORD_NUMBER_SOURCE,
};
