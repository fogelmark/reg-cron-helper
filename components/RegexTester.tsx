"use client";

import { useState, useMemo } from 'react';
import { explainRegex } from '@/lib/regex-explainer';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [error, setError] = useState('');

  const { matches, highlightedText, tokens } = useMemo(() => {
    if (!pattern) {
      return { matches: [], highlightedText: testText, tokens: [] };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matchesArray: RegExpExecArray[] = [];
      let match;

      // Get all matches
      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          matchesArray.push(match);
          // Prevent infinite loops on zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) matchesArray.push(match);
      }

      // Create highlighted text
      let highlighted = testText;
      if (matchesArray.length > 0) {
        const parts: { start: number; end: number; }[] = [];
        matchesArray.forEach(m => {
          if (m[0].length > 0) {
            parts.push({ start: m.index, end: m.index + m[0].length });
          }
        });

        // Sort by position
        parts.sort((a, b) => a.start - b.start);

        // Build highlighted string
        let result = '';
        let lastIndex = 0;
        parts.forEach((part, idx) => {
          result += testText.substring(lastIndex, part.start);
          result += `<mark class="bg-yellow-300 dark:bg-yellow-600">${testText.substring(part.start, part.end)}</mark>`;
          lastIndex = part.end;
        });
        result += testText.substring(lastIndex);
        highlighted = result;
      }

      // Get explanation tokens
      const explanationTokens = explainRegex(pattern);

      setError('');
      return { matches: matchesArray, highlightedText: highlighted, tokens: explanationTokens };
    } catch (e) {
      setError((e as Error).message);
      return { matches: [], highlightedText: testText, tokens: [] };
    }
  }, [pattern, flags, testText]);

  return (
    <div className="space-y-6">
      {/* Pattern Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Regex Pattern</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter your regex pattern here..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <div className="flex gap-1 items-center bg-gray-800 border border-gray-700 rounded-lg px-3">
            {['g', 'i', 'm'].map(flag => (
              <label key={flag} className="flex items-center gap-1 cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={flags.includes(flag)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags + flag);
                    } else {
                      setFlags(flags.replace(flag, ''));
                    }
                  }}
                  className="cursor-pointer"
                />
                <span className="text-sm font-mono">{flag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            <strong>Invalid regex:</strong> {error}
          </p>
        </div>
      )}

      {/* Explanation */}
      {!error && tokens.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Explanation</h3>
          <div className="space-y-1">
            {tokens.map((token, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <code className="bg-gray-900 px-2 py-1 rounded font-mono text-blue-400 min-w-[100px]">
                  {token.token}
                </code>
                <span className="text-gray-300">{token.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Test Data</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter or paste text to test against..."
          rows={8}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {/* Highlighted Text */}
      {testText && (
        <div>
          <h3 className="text-sm font-medium mb-2">Results ({matches.length} match{matches.length !== 1 ? 'es' : ''})</h3>
          <div
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      )}

      {/* Matches List */}
      {matches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Matches</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700">
            {matches.map((match, idx) => (
              <div key={idx} className="p-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 text-sm font-mono">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="font-mono text-sm bg-gray-900 px-2 py-1 rounded inline-block mb-2">
                      {match[0]}
                    </div>
                    <div className="text-xs text-gray-400">
                      Position: {match.index} - {match.index + match[0].length}
                    </div>
                    {match.length > 1 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-400">Capture groups:</div>
                        {match.slice(1).map((group, groupIdx) => (
                          <div key={groupIdx} className="text-xs flex gap-2">
                            <span className="text-gray-500">Group {groupIdx + 1}:</span>
                            <code className="bg-gray-900 px-1 rounded">{group || '(empty)'}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
