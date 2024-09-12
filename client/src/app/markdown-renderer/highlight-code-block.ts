import highlightJs from 'highlight.js';

export function highlightCodeBlock(code: string, language: string | undefined) {
  if (language) {
    return highlightJs.highlight(code, {
      language,
    }).value;
  }

  return code;
}