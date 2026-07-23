export interface RegexToken {
  token: string;
  explanation: string;
  position: number;
}

export function explainRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];
    const remaining = pattern.substring(i);

    // Anchors
    if (char === '^') {
      tokens.push({ token: '^', explanation: 'Start of line/string', position: i });
      i++;
    } else if (char === '$') {
      tokens.push({ token: '$', explanation: 'End of line/string', position: i });
      i++;
    }
    // Word boundaries
    else if (remaining.startsWith('\\b')) {
      tokens.push({ token: '\\b', explanation: 'Word boundary', position: i });
      i += 2;
    } else if (remaining.startsWith('\\B')) {
      tokens.push({ token: '\\B', explanation: 'Non-word boundary', position: i });
      i += 2;
    }
    // Character classes
    else if (remaining.startsWith('\\d')) {
      tokens.push({ token: '\\d', explanation: 'Digit (0-9)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\D')) {
      tokens.push({ token: '\\D', explanation: 'Non-digit', position: i });
      i += 2;
    } else if (remaining.startsWith('\\w')) {
      tokens.push({ token: '\\w', explanation: 'Word character (a-z, A-Z, 0-9, _)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\W')) {
      tokens.push({ token: '\\W', explanation: 'Non-word character', position: i });
      i += 2;
    } else if (remaining.startsWith('\\s')) {
      tokens.push({ token: '\\s', explanation: 'Whitespace (space, tab, newline)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\S')) {
      tokens.push({ token: '\\S', explanation: 'Non-whitespace', position: i });
      i += 2;
    }
    // Special characters
    else if (char === '.') {
      tokens.push({ token: '.', explanation: 'Any character (except newline)', position: i });
      i++;
    }
    // Quantifiers
    else if (char === '*') {
      tokens.push({ token: '*', explanation: '0 or more repetitions', position: i });
      i++;
    } else if (char === '+') {
      tokens.push({ token: '+', explanation: '1 or more repetitions', position: i });
      i++;
    } else if (char === '?') {
      tokens.push({ token: '?', explanation: '0 or 1 repetition (optional)', position: i });
      i++;
    }
    // Quantifier ranges
    else if (char === '{') {
      const closingBrace = pattern.indexOf('}', i);
      if (closingBrace !== -1) {
        const quantifier = pattern.substring(i, closingBrace + 1);
        const content = quantifier.slice(1, -1);
        if (content.includes(',')) {
          const [min, max] = content.split(',');
          if (max === '') {
            tokens.push({ token: quantifier, explanation: `${min} or more repetitions`, position: i });
          } else {
            tokens.push({ token: quantifier, explanation: `${min} to ${max} repetitions`, position: i });
          }
        } else {
          tokens.push({ token: quantifier, explanation: `Exactly ${content} repetitions`, position: i });
        }
        i = closingBrace + 1;
      } else {
        i++;
      }
    }
    // Character sets
    else if (char === '[') {
      const closingBracket = pattern.indexOf(']', i);
      if (closingBracket !== -1) {
        const charSet = pattern.substring(i, closingBracket + 1);
        const isNegated = charSet.startsWith('[^');
        const content = isNegated ? charSet.slice(2, -1) : charSet.slice(1, -1);

        if (isNegated) {
          tokens.push({ token: charSet, explanation: `Any character EXCEPT: ${content}`, position: i });
        } else {
          tokens.push({ token: charSet, explanation: `Any of these characters: ${content}`, position: i });
        }
        i = closingBracket + 1;
      } else {
        i++;
      }
    }
    // Groups
    else if (char === '(') {
      let depth = 1;
      let j = i + 1;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(' && pattern[j - 1] !== '\\') depth++;
        if (pattern[j] === ')' && pattern[j - 1] !== '\\') depth--;
        j++;
      }

      const group = pattern.substring(i, j);
      if (group.startsWith('(?:')) {
        tokens.push({ token: group, explanation: 'Non-capturing group', position: i });
      } else if (group.startsWith('(?=')) {
        tokens.push({ token: group, explanation: 'Positive lookahead', position: i });
      } else if (group.startsWith('(?!')) {
        tokens.push({ token: group, explanation: 'Negative lookahead', position: i });
      } else if (group.startsWith('(?<=')) {
        tokens.push({ token: group, explanation: 'Positive lookbehind', position: i });
      } else if (group.startsWith('(?<!')) {
        tokens.push({ token: group, explanation: 'Negative lookbehind', position: i });
      } else {
        tokens.push({ token: group, explanation: 'Capturing group', position: i });
      }
      i = j;
    }
    // Alternation
    else if (char === '|') {
      tokens.push({ token: '|', explanation: 'OR (alternation)', position: i });
      i++;
    }
    // Escaped characters
    else if (char === '\\' && nextChar && !['d', 'D', 'w', 'W', 's', 'S', 'b', 'B'].includes(nextChar)) {
      tokens.push({ token: `\\${nextChar}`, explanation: `Literal character: ${nextChar}`, position: i });
      i += 2;
    }
    // Literal characters
    else {
      // Group consecutive literal characters
      let literalChars = char;
      let j = i + 1;
      while (j < pattern.length && !/[\\^$.*+?()[\]{}|]/.test(pattern[j])) {
        literalChars += pattern[j];
        j++;
      }
      if (literalChars.length > 1) {
        tokens.push({ token: literalChars, explanation: `Literal text: "${literalChars}"`, position: i });
        i = j;
      } else {
        tokens.push({ token: char, explanation: `Literal character: "${char}"`, position: i });
        i++;
      }
    }
  }

  return tokens;
}
