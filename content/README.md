# Writing and publishing articles

Every article lives in `content/articles` as a Markdown file. The filename becomes its URL:

```text
content/articles/my-new-post.md
→ /writing/my-new-post
```

## Add a post

1. Copy `_template.md` and rename the copy.
2. Fill in the frontmatter at the top.
3. Write the article underneath using normal Markdown.
4. Keep `draft: "true"` while working.
5. Change it to `draft: "false"` when the article is ready.

The homepage finds the file automatically. No page component or article index needs to be edited.

## Frontmatter fields

- `title`: article title
- `description`: homepage and metadata summary
- `category`: topic label
- `topics`: comma-separated filter tags, such as `"linux, performance, architecture"`
- `date`: publication date in YYYY-MM-DD
- `readingTime`: optional; calculated from the article length when left out. Set it (for example `"7 min read"`) to override the estimate
- `accent`: `"lime"`, `"orange"`, or `"blue"`
- `featured`: use `"true"` for the large homepage card
- `draft`: drafts stay hidden from the public site until changed to `"false"`
- `order`: lower numbers appear first

## Supported Markdown

Articles use GitHub-flavoured Markdown: headings, paragraphs, bold, emphasis,
strikethrough, inline code, links, images, blockquotes, bulleted and numbered
lists (including nested lists and task lists), fenced code blocks with syntax
highlighting, tables, footnotes, and horizontal rules.

Math is supported with `$inline$` and `$$` display blocks. Write `\$` for a
literal dollar sign.

Raw HTML is not rendered. Only `##` and `###` headings appear in the article's
"On this page" list.

## Feed and sitemap

`/feed.xml` (RSS), `/sitemap.xml`, and `/robots.txt` are generated from the
published articles at build time. Nothing needs to be edited by hand.
