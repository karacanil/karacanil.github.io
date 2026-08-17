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
- `readingTime`: short label such as `"7 min read"`
- `accent`: `"lime"`, `"orange"`, or `"blue"`
- `featured`: use `"true"` for the large homepage card
- `draft`: drafts stay hidden from the public site until changed to `"false"`
- `order`: lower numbers appear first

## Supported Markdown

Headings, paragraphs, bold, emphasis, inline code, links, images, blockquotes,
bulleted and numbered lists, fenced code blocks, tables, and horizontal rules
all inherit the site's article styling.
