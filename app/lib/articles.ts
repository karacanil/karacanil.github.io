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

export function getAllArticles(): Article[] {
  if (articleCache) return articleCache;

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

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((article) => !article.draft);
}

export function getPublishedArticleSummaries(): ArticleSummary[] {
  return getPublishedArticles().map(
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
    }),
  );
}

export function getHeadings(markdown: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  return markdown
    .split("\n")
    .map((line) => {
      const match = line.match(/^(##|###)\s+(.+)$/);
      if (!match) return null;

      return {
        level: match[1].length,
        text: match[2].replace(/[*_`]/g, ""),
        id: slugifyHeading(match[2]),
      };
    })
    .filter((heading): heading is { level: number; text: string; id: string } =>
      Boolean(heading),
    );
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
