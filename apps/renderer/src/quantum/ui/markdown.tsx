import { Fragment, type ReactNode } from "react";

/**
 * Light markdown for assistant replies, rendered as React elements (never innerHTML), so model
 * text is always escaped. Supports paragraphs, line breaks, "-"/"*" bullet lists, numbered lists,
 * headings (rendered small), fenced code blocks, inline code, **bold**, *italic* and http(s) links.
 * Safe on partial (streaming) input: an unclosed fence renders as code so far.
 */

const INLINE_SOURCE =
  /(`+)([^`]+?)\1|\*\*([^*\n]+?)\*\*|__([^_\n]+?)__|(?<![\w*])\*(?!\s)([^*\n]+?)\*(?!\w)|(?<![\w_])_(?!\s)([^_\n]+?)_(?!\w)|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  // A fresh regex per call: the recursion for bold/italic must not share `lastIndex`.
  const re = new RegExp(INLINE_SOURCE, "g");
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2] !== undefined) out.push(<code key={k}>{m[2]}</code>);
    else if (m[3] !== undefined || m[4] !== undefined) out.push(<strong key={k}>{inline(m[3] ?? m[4], k)}</strong>);
    else if (m[5] !== undefined || m[6] !== undefined) out.push(<em key={k}>{inline(m[5] ?? m[6], k)}</em>);
    else if (m[7] !== undefined)
      out.push(
        <a key={k} href={m[8]} target="_blank" rel="noopener noreferrer">
          {m[7]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function lines(textLines: string[], keyBase: string): ReactNode[] {
  return textLines.map((l, i) => (
    <Fragment key={`${keyBase}-l${i}`}>
      {i > 0 ? <br /> : null}
      {inline(l, `${keyBase}-l${i}`)}
    </Fragment>
  ));
}

const BULLET = /^\s{0,3}[-*+•]\s+(.*)$/;
const NUMBERED = /^\s{0,3}(\d{1,3})[.)]\s+(.*)$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const FENCE = /^\s{0,3}(```|~~~)\s*([\w+-]*)\s*$/;

export function Markdown({ text, className }: { text: string; className?: string }) {
  const src = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;

  while (i < src.length) {
    const line = src[i];
    const key = `b${b++}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < src.length && !new RegExp(`^\\s{0,3}${fence[1]}\\s*$`).test(src[i])) body.push(src[i++]);
      i++; // closing fence (or end)
      blocks.push(
        <pre key={key} data-lang={fence[2] || undefined}>
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push(<h4 key={key}>{inline(heading[1], key)}</h4>);
      i++;
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      const ordered = !BULLET.test(line);
      const re = ordered ? NUMBERED : BULLET;
      const start = ordered ? Number(NUMBERED.exec(line)![1]) : undefined;
      const items: string[][] = [];
      while (i < src.length) {
        const l = src[i];
        const m = re.exec(l);
        if (m) {
          items.push([ordered ? m[2] : m[1]]);
          i++;
        } else if (l.trim() && /^\s{2,}\S/.test(l) && items.length) {
          items[items.length - 1].push(l.trim()); // indented continuation
          i++;
        } else if (!l.trim() && i + 1 < src.length && re.test(src[i + 1])) {
          i++; // loose list: blank line between items
        } else break;
      }
      const children = items.map((it, j) => <li key={`${key}-${j}`}>{lines(it, `${key}-${j}`)}</li>);
      blocks.push(
        ordered ? (
          <ol key={key} start={start !== 1 ? start : undefined}>
            {children}
          </ol>
        ) : (
          <ul key={key}>{children}</ul>
        ),
      );
      continue;
    }

    const para: string[] = [];
    while (i < src.length && src[i].trim() && !FENCE.test(src[i]) && !HEADING.test(src[i]) && !BULLET.test(src[i]) && !NUMBERED.test(src[i])) {
      para.push(src[i++]);
    }
    blocks.push(<p key={key}>{lines(para, key)}</p>);
  }

  return <div className={["q-md", className].filter(Boolean).join(" ")}>{blocks}</div>;
}
