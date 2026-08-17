import { slugifyHeading } from "../lib/articles";

type InlinePart = string | React.ReactElement;

function renderInline(text: string): InlinePart[] {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{renderInline(part.slice(2, -2))}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{renderInline(part.slice(1, -1))}</em>;
    }

    const image = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      return <img key={index} src={image[2]} alt={image[1]} />;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={index}
          href={link[2]}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {link[1]}
        </a>
      );
    }

    return part;
  });
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index] ?? "";
  const next = lines[index + 1] ?? "";

  return (
    /^#{2,3}\s+/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^---+$/.test(line.trim()) ||
    /^!\[[^\]]*\]\([^)]+\)$/.test(line.trim()) ||
    (line.includes("|") && /^\s*\|?[-:\s|]+\|?\s*$/.test(next))
  );
}

function parseCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let index = 0;
  let paragraphCount = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([^\s]*)\s*$/);
    if (fence) {
      const language = fence[1] || "code";
      const code: string[] = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre className="code-block" data-language={language} key={blocks.length}>
          <span className="code-window"><i /><i /><i /></span>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(##|###)\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const id = slugifyHeading(text);

      blocks.push(
        level === 2 ? (
          <h2 id={id} key={blocks.length}>{renderInline(text)}</h2>
        ) : (
          <h3 id={id} key={blocks.length}>{renderInline(text)}</h3>
        ),
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote key={blocks.length}>
          <span>NOTE</span>
          <p>{renderInline(quote.join(" "))}</p>
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ul key={blocks.length}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push(
        <ol key={blocks.length}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ol>,
      );
      continue;
    }

    if (line.includes("|") && /^\s*\|?[-:\s|]+\|?\s*$/.test(lines[index + 1] ?? "")) {
      const headers = parseCells(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(parseCells(lines[index]));
        index += 1;
      }

      blocks.push(
        <div className="table-wrap" key={blocks.length}>
          <table>
            <thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex}>{renderInline(cell)}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      blocks.push(
        <figure key={blocks.length}>
          <img src={image[2]} alt={image[1]} />
          {image[1] && <figcaption>{image[1]}</figcaption>}
        </figure>,
      );
      index += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} />);
      index += 1;
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;

    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p className={paragraphCount === 0 ? "lead" : undefined} key={blocks.length}>
        {renderInline(paragraph.join(" "))}
      </p>,
    );
    paragraphCount += 1;
  }

  return <>{blocks}</>;
}

