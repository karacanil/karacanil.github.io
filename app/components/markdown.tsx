import rehypeShiki from "@shikijs/rehype";
import type { Element, ElementContent, Root } from "hast";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { slugifyHeading } from "../lib/articles";

// Everything here runs at build time inside a server component: the output is
// plain HTML, so no Markdown, highlighting, or math code is sent to the browser.

function textOf(node: ElementContent | Element): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

function isImageOnly(node: Element | undefined): boolean {
  if (!node) return false;
  const meaningful = node.children.filter(
    (child) => !(child.type === "text" && !child.value.trim()),
  );
  return (
    meaningful.length === 1 &&
    meaningful[0].type === "element" &&
    meaningful[0].tagName === "img"
  );
}

/** Marks the first top-level text paragraph as the article introduction. */
function rehypeLead() {
  return (tree: Root) => {
    const first = tree.children.find(
      (node): node is Element =>
        node.type === "element" && node.tagName === "p" && !isImageOnly(node),
    );
    if (first) first.properties.className = ["lead"];
  };
}

const shikiOptions = {
  theme: "vitesse-dark",
  lazy: true,
  defaultLanguage: "text",
  fallbackLanguage: "text",
  transformers: [
    {
      name: "working-set-code-block",
      pre(this: { options: { lang: string } }, node: Element) {
        // The site's own .code-block styles provide the frame and background.
        delete node.properties.style;
        node.properties["data-language"] = this.options.lang;
      },
    },
  ],
};

function heading(Tag: "h2" | "h3") {
  return function Heading({
    node,
    children,
    id,
    className,
  }: React.ComponentProps<"h2"> & { node?: Element }) {
    return (
      <Tag className={className} id={id ?? (node ? slugifyHeading(textOf(node)) : undefined)}>
        {children}
      </Tag>
    );
  };
}

const components: Components = {
  h2: heading("h2"),
  h3: heading("h3"),
  p({ node, children, className }) {
    if (isImageOnly(node)) {
      const image = node?.children.find(
        (child): child is Element => child.type === "element",
      );
      const alt = String(image?.properties.alt ?? "");
      return (
        <figure>
          {children}
          {alt && <figcaption>{alt}</figcaption>}
        </figure>
      );
    }
    return <p className={className}>{children}</p>;
  },
  a({ href, children, node, ...rest }) {
    void node;
    const external = /^https?:\/\//.test(href ?? "");
    return (
      <a
        {...rest}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
  pre({ children, ...rest }) {
    const language = (rest as { "data-language"?: string })["data-language"];
    return (
      <pre
        className="code-block"
        data-language={!language || language === "text" ? "code" : language}
        tabIndex={0}
      >
        <span className="code-window"><i /><i /><i /></span>
        {children}
      </pre>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote>
        <span>NOTE</span>
        {children}
      </blockquote>
    );
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

export function Markdown({ content }: { content: string }) {
  return (
    <MarkdownAsync
      components={components}
      rehypePlugins={[rehypeKatex, [rehypeShiki, shikiOptions], rehypeLead]}
      remarkPlugins={[remarkGfm, remarkMath]}
    >
      {content}
    </MarkdownAsync>
  );
}
