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
      tokens.push({ token: '^', explanation: 'Start av rad/sträng', position: i });
      i++;
    } else if (char === '$') {
      tokens.push({ token: '$', explanation: 'Slut av rad/sträng', position: i });
      i++;
    }
    // Word boundaries
    else if (remaining.startsWith('\\b')) {
      tokens.push({ token: '\\b', explanation: 'Ordgräns', position: i });
      i += 2;
    } else if (remaining.startsWith('\\B')) {
      tokens.push({ token: '\\B', explanation: 'Icke-ordgräns', position: i });
      i += 2;
    }
    // Character classes
    else if (remaining.startsWith('\\d')) {
      tokens.push({ token: '\\d', explanation: 'Siffra (0-9)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\D')) {
      tokens.push({ token: '\\D', explanation: 'Icke-siffra', position: i });
      i += 2;
    } else if (remaining.startsWith('\\w')) {
      tokens.push({ token: '\\w', explanation: 'Ordtecken (a-z, A-Z, 0-9, _)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\W')) {
      tokens.push({ token: '\\W', explanation: 'Icke-ordtecken', position: i });
      i += 2;
    } else if (remaining.startsWith('\\s')) {
      tokens.push({ token: '\\s', explanation: 'Whitespace (mellanslag, tab, newline)', position: i });
      i += 2;
    } else if (remaining.startsWith('\\S')) {
      tokens.push({ token: '\\S', explanation: 'Icke-whitespace', position: i });
      i += 2;
    }
    // Special characters
    else if (char === '.') {
      tokens.push({ token: '.', explanation: 'Vilket tecken som helst (utom newline)', position: i });
      i++;
    }
    // Quantifiers
    else if (char === '*') {
      tokens.push({ token: '*', explanation: '0 eller fler upprepningar', position: i });
      i++;
    } else if (char === '+') {
      tokens.push({ token: '+', explanation: '1 eller fler upprepningar', position: i });
      i++;
    } else if (char === '?') {
      tokens.push({ token: '?', explanation: '0 eller 1 upprepning (optional)', position: i });
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
            tokens.push({ token: quantifier, explanation: `${min} eller fler upprepningar`, position: i });
          } else {
            tokens.push({ token: quantifier, explanation: `${min} till ${max} upprepningar`, position: i });
          }
        } else {
          tokens.push({ token: quantifier, explanation: `Exakt ${content} upprepningar`, position: i });
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
          tokens.push({ token: charSet, explanation: `Vilket tecken som helst UTOM: ${content}`, position: i });
        } else {
          tokens.push({ token: charSet, explanation: `Något av tecknen: ${content}`, position: i });
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
        tokens.push({ token: group, explanation: 'Icke-fångande grupp', position: i });
      } else if (group.startsWith('(?=')) {
        tokens.push({ token: group, explanation: 'Positiv lookahead', position: i });
      } else if (group.startsWith('(?!')) {
        tokens.push({ token: group, explanation: 'Negativ lookahead', position: i });
      } else if (group.startsWith('(?<=')) {
        tokens.push({ token: group, explanation: 'Positiv lookbehind', position: i });
      } else if (group.startsWith('(?<!')) {
        tokens.push({ token: group, explanation: 'Negativ lookbehind', position: i });
      } else {
        tokens.push({ token: group, explanation: 'Fångande grupp (capture group)', position: i });
      }
      i = j;
    }
    // Alternation
    else if (char === '|') {
      tokens.push({ token: '|', explanation: 'ELLER (alternativ)', position: i });
      i++;
    }
    // Escaped characters
    else if (char === '\\' && nextChar && !['d', 'D', 'w', 'W', 's', 'S', 'b', 'B'].includes(nextChar)) {
      tokens.push({ token: `\\${nextChar}`, explanation: `Literalt tecken: ${nextChar}`, position: i });
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
        tokens.push({ token: char, explanation: `Literal tecken: "${char}"`, position: i });
        i++;
      }
    }
  }

  return tokens;
}
