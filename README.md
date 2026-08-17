# The Working Set

A static, Markdown-powered publication about software engineering, computer
vision, games, embedded systems, and related projects.

## Write an article

1. Copy `content/articles/_template.md`.
2. Rename it to the URL slug you want, such as `my-new-post.md`.
3. Write the post in Markdown and complete its frontmatter.
4. Set `draft: "false"` when it is ready to publish.
5. Commit and push to `master`.

GitHub Actions rebuilds and deploys the site automatically after every push to
`master`. Full authoring details are in `content/README.md`.

## Work locally

```bash
npm ci
npm run dev
```

Run `npm run build` to generate the complete static site in `out/`.

## Initial GitHub Pages setting

In the repository, open **Settings → Pages** and set **Source** to
**GitHub Actions**. This only needs to be done once.
