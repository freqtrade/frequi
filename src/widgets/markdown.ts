/**
 * Minimal, safe markdown renderer for note widgets.
 * All input is HTML-escaped first; only a fixed set of tags is produced and
 * links are limited to http(s) URLs.
 *
 * Supported: # headings, **bold**, *italic*, `code`, [links](https://…),
 * - lists, 1. lists, - [ ] / - [x] checklists, > quotes, --- rules.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_m, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
  return s;
}

export function renderMarkdown(src: string): string {
  const lines = (src ?? '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };

  lines.forEach((raw, lineNo) => {
    const line = raw.trimEnd();
    const task = /^\s*[-*] \[( |x|X)\] (.*)$/.exec(line);
    const bullet = /^\s*[-*] (.*)$/.exec(line);
    const numbered = /^\s*\d+[.)] (.*)$/.exec(line);
    const heading = /^(#{1,3}) (.*)$/.exec(line);

    if (task) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul class="md-tasks">');
        list = 'ul';
      }
      const checked = task[1]!.toLowerCase() === 'x';
      out.push(
        `<li><label><input type="checkbox" data-line="${lineNo}"${checked ? ' checked' : ''}> <span${checked ? ' class="md-done"' : ''}>${inline(task[2]!)}</span></label></li>`,
      );
    } else if (bullet) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${inline(bullet[1]!)}</li>`);
    } else if (numbered) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${inline(numbered[1]!)}</li>`);
    } else {
      closeList();
      if (heading) {
        const level = heading[1]!.length + 1; // h2-h4, the widget already has a title
        out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      } else if (/^-{3,}$/.test(line)) {
        out.push('<hr>');
      } else if (line.startsWith('> ')) {
        out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      } else if (line.trim()) {
        out.push(`<p>${inline(line)}</p>`);
      }
    }
  });
  closeList();
  return out.join('\n');
}

/** Toggles the checklist item on the given line. */
export function toggleTask(src: string, lineNo: number): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const line = lines[lineNo];
  if (line === undefined) return src;
  lines[lineNo] = line.replace(
    /^(\s*[-*] \[)( |x|X)(\])/,
    (_m, a: string, mark: string, b: string) => `${a}${mark === ' ' ? 'x' : ' '}${b}`,
  );
  return lines.join('\n');
}
