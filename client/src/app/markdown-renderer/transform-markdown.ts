import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { highlightCodeBlock } from './highlight-code-block';

marked.use(markedHighlight({ highlight: highlightCodeBlock }));

export const markdownToHtml = (content: string) => {
  return marked(content);
};
