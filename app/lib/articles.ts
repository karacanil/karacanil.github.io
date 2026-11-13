import "server-only";
import fs from "node:fs";
import path from "node:path";

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  topics: string[];
  date: string;
  displayDate: string;
  readingTime: string;
  accent: "lime" | "orange" | "blue";
  featured: boolean;
  draft: boolean;
  order: number;
  content: string;
};

export type ArticleSummary = Pick<
  Article,
  | "slug"
  | "title"
  | "description"
  | "category"
  | "topics"
  | "displayDate"
  | "readingTime"
  | "accent"
  | "featured"
  | "draft"
>;

type Frontmatter = Record<string, string>;

const articlesDirectory = path.join(process.cwd(), "content", "articles");
let articleCache: Article[] | null = null;

function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);

  if (!match) {
    throw new Error("Article is missing frontmatter.");
  }

  const data: Frontmatter = {};

  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return {
    data,
    content: raw.slice(match[0].length).trim(),
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function toBoolean(value: string | undefined): boolean {
  return value === "true";
}

function parseTopics(value: string | undefined, fallback: string): string[] {
  const seen = new Set<string>();

  return (value || fallback)
    .split(",")
    .map((topic) => topic.trim())
    .filter((topic) => {
      const key = topic.toLowerCase();
      if (!topic || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function articleFromFile(path: string, raw: string): Article {
  const { data, content } = parseFrontmatter(raw);
  const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";

  if (!data.title || !data.description || !data.category || !data.date) {
    throw new Error(`Article "${slug}" is missing required frontmatter.`);
  }

  const accent =
    data.accent === "orange" || data.accent === "blue" ? data.accent : "lime";

  return {
    slug,
    title: data.title,
    description: data.description,
    category: data.category,
    topics: parseTopics(data.topics, data.category),
    date: data.date,
    displayDate: formatDate(data.date),
    readingTime: data.readingTime || "5 min read",
    accent,
    featured: toBoolean(data.featured),
    draft: toBoolean(data.draft),
    order: Number(data.order || 999),
    content,
  };
}

/**
 * `npm run dev` shows drafts so an article can be previewed before publishing.
 * Production builds (and therefore the deployed site) never include them.
 */
const isDevelopment = process.env.NODE_ENV === "development";

export function getAllArticles(): Article[] {
  // Re-read the files on every request in development so edits show up on reload.
  if (articleCache && !isDevelopment) return articleCache;

  articleCache = fs
    .readdirSync(articlesDirectory)
    .filter((filename) => filename.endsWith(".md") && !filename.startsWith("_"))
    .map((filename) =>
      articleFromFile(
        filename,
        fs.readFileSync(path.join(articlesDirectory, filename), "utf8"),
      ),
    )
    .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));

  return articleCache;
}

export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((article) => !article.draft);
}

/** Articles that get a page: published ones, plus drafts in development. */
export function getVisibleArticles(): Article[] {
  return isDevelopment ? getAllArticles() : getPublishedArticles();
}

export function getVisibleArticleSummaries(): ArticleSummary[] {
  return getVisibleArticles().map(
    ({
      slug,
      title,
      description,
      category,
      topics,
      displayDate,
      readingTime,
      accent,
      featured,
      draft,
    }) => ({
      slug,
      title,
      description,
      category,
      topics,
      displayDate,
      readingTime,
      accent,
      featured,
      draft,
    }),
  );
}

export function getHeadings(markdown: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let fence: string | null = null;

  for (const line of markdown.split("\n")) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence) continue;

    const match = line.match(/^(##|###)\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    // Reduce Markdown syntax to the text a reader sees, so the id matches the
    // one the renderer derives from the rendered heading.
    const text = match[2]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*`~]|\b_|_\b/g, "");

    headings.push({
      level: match[1].length,
      text,
      id: slugifyHeading(text),
    });
  }

  return headings;
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
