# The Working Set: Article Management Guide

This is the reference guide for adding, previewing, publishing, editing, hiding,
renaming, and removing articles on **The Working Set**.

The site is a static Next.js site hosted by GitHub Pages. Articles are Markdown
files stored in `content/articles`. Pushing a change to the `master` branch
starts the GitHub Actions deployment automatically.

## Quick reference

| Task | What to do |
| --- | --- |
| Create an article | Copy `content/articles/_template.md` and rename the copy |
| Preview without publishing | Keep `draft: "true"` and run the site locally |
| Publish | Set `draft: "false"`, commit, and push to `master` |
| Edit an article | Change its Markdown file, commit, and push |
| Temporarily hide an article | Change `draft` to `"true"`, commit, and push |
| Permanently remove an article | Delete its Markdown file, commit, and push |
| Change an article URL | Rename its Markdown file, commit, and push |
| Check deployment | Open the repository's **Actions** tab |

## 1. Prepare your local copy

The repository is:

<https://github.com/karacanil/karacanil.github.io>

If you do not already have it on your computer, clone it over SSH:

```bash
git clone git@github.com:karacanil/karacanil.github.io.git
cd karacanil.github.io
npm ci
```

Before beginning a new article or changing an existing one, update your local
`master` branch:

```bash
git switch master
git pull origin master
```

The project requires Node.js 22.13 or newer. Check your installed version with:

```bash
node --version
```

## 2. Create a new article

Copy the provided template. Replace `my-new-article` with a short URL-friendly
name for the article:

```bash
cp content/articles/_template.md content/articles/my-new-article.md
```

Use lowercase letters, numbers, and hyphens in the filename. Avoid spaces,
underscores, accented characters, and punctuation.

The filename is the article's permanent URL slug:

```text
content/articles/my-new-article.md
https://karacanil.github.io/writing/my-new-article/
```

Open the new file in your editor. It begins with frontmatter between two `---`
lines, followed by the article body:

```markdown
---
title: "Your article title"
description: "A one-sentence summary shown on the homepage and in search results."
category: "Software engineering"
topics: "architecture, performance, linux"
date: "2026-08-17"
readingTime: "5 min read"
accent: "lime"
featured: "false"
draft: "true"
order: "10"
---

Start writing here. The first paragraph is styled as the introduction.

## Your first section

Continue the article here.
```

Keep the quotation marks around frontmatter values. This site's frontmatter
reader is intentionally simple; each field should remain on one line.

### Frontmatter fields

| Field | Required? | Purpose |
| --- | --- | --- |
| `title` | Yes | Full title on the homepage and article page |
| `description` | Yes | Homepage summary and search/social metadata description |
| `category` | Yes | Primary category displayed on the article card |
| `topics` | Recommended | Comma-separated topic filters; falls back to `category` when omitted |
| `date` | Yes | Publication date in `YYYY-MM-DD` format |
| `readingTime` | No | Display label; defaults to `5 min read` |
| `accent` | No | Card color: `lime`, `orange`, or `blue`; defaults to `lime` |
| `featured` | No | `"true"` gives the article the large homepage card |
| `draft` | No | Only the exact value `"true"` hides the article; use it while writing |
| `order` | No | Lower numbers appear first; defaults to `999` |

Topic names are case-insensitive when filtering. Keep the same spelling and
capitalization across articles for a clean topic list. Repeated topics in one
article are removed automatically.

Article order is determined first by `order` (lowest first), then by `date`
(newest first) when two articles have the same order. Avoid marking many
articles as featured; the large card treatment is intended to be selective.

## 3. Write with the supported Markdown

The article renderer supports:

- Paragraphs
- Level-two and level-three headings (`##` and `###`)
- **Bold text**, *emphasis*, and `inline code`
- Links and images
- Bulleted and numbered lists
- Blockquotes
- Fenced code blocks with an optional language label
- Tables
- Horizontal rules

Example:

````markdown
## Section heading

Normal text with **bold**, *emphasis*, `inline code`, and a
[link](https://example.com).

- First item
- Second item

> A blockquote is rendered as a highlighted note.

```cpp
int main() {
  return 0;
}
```

| Column A | Column B |
| --- | --- |
| Value | Value |
````

Use `##` for main sections and `###` for subsections. These headings are also
used to generate the article's table of contents. Do not put another `#` title
in the body; the page already renders the title from frontmatter.

The current renderer does not support every extended Markdown feature. Avoid
raw HTML, nested lists, task lists, footnotes, heading levels below `###`, and
complex Markdown embedded inside table cells.

### Add images

Store article images under a dedicated folder in `public/images/articles`:

```text
public/images/articles/my-new-article/diagram.png
```

Reference the image from Markdown with a root-relative URL:

```markdown
![A useful description of the diagram](/images/articles/my-new-article/diagram.png)
```

Use descriptive alt text, lowercase filenames, and compressed web-friendly
images. Remember to commit the image files together with the Markdown file.

## 4. Preview the article locally

Leave `draft: "true"` while writing. Start the development server:

```bash
npm run dev
```

Open <http://localhost:3000> in a browser. The homepage intentionally hides
drafts. To preview a draft directly during local development, open:

```text
http://localhost:3000/writing/my-new-article/
```

Stop the development server with `Ctrl+C`.

Before publishing, run the same important checks used by the project:

```bash
npm run lint
npm run typecheck
npm run build
```

The build must finish successfully. A missing required frontmatter field,
invalid date, or malformed source file can prevent the entire deployment.

## 5. Publish the article

When the article is ready, change:

```yaml
draft: "true"
```

to:

```yaml
draft: "false"
```

Review the changes before committing:

```bash
git status
git diff
```

Commit and push:

```bash
git add content/articles/my-new-article.md
git add public/images/articles/my-new-article
git commit -m "Publish my new article"
git push origin master
```

If the article has no images, omit the second `git add` command. If you changed
other intentional files, add those exact paths as well. Avoid `git add .` when
you are unsure what else has changed.

The push starts `.github/workflows/deploy-pages.yml`. In GitHub:

1. Open the repository.
2. Select **Actions**.
3. Open the newest **Deploy The Working Set** run.
4. Wait for both the build and deploy jobs to turn green.
5. Open <https://karacanil.github.io/> and test the homepage card, topic filters,
   article link, headings, code blocks, tables, images, and mobile layout.

Deployment usually takes a few minutes. If the workflow succeeds but the old
version remains visible, hard-refresh the page or try a private browser tab.

## 6. Edit an existing article

Pull the latest version first:

```bash
git switch master
git pull origin master
```

Edit the article's existing file under `content/articles`. You may change its
body or any frontmatter value. Then validate, commit, and push:

```bash
npm run typecheck
npm run build
git add content/articles/existing-article.md
git commit -m "Update existing article"
git push origin master
```

Changing `title`, `description`, `category`, `topics`, `date`, `readingTime`,
`accent`, `featured`, or `order` does **not** change the URL. Renaming the file
does change the URL.

## 7. Hide, restore, or remove an article

### Temporarily hide it

Set the article to:

```yaml
draft: "true"
```

Commit and push the change. The next deployment removes it from the homepage,
topic filters, and generated public article routes. The Markdown file stays in
the repository and can be restored later by setting `draft` back to `"false"`.

This is the safest choice when you may want the article again.

### Permanently remove it

Delete the Markdown file with Git:

```bash
git rm content/articles/article-to-remove.md
git commit -m "Remove article title"
git push origin master
```

If its images are not used anywhere else, remove their dedicated folder too:

```bash
git rm -r public/images/articles/article-to-remove
```

After deployment, the old article URL returns a not-found page. Existing links
from search engines, social media, or other sites will break.

### Restore a deleted article

Find the commit that removed it:

```bash
git log -- content/articles/article-to-remove.md
```

Restore the file from the commit immediately before deletion:

```bash
git restore --source=<commit-before-deletion> -- content/articles/article-to-remove.md
git add content/articles/article-to-remove.md
git commit -m "Restore article title"
git push origin master
```

## 8. Rename an article or change its URL

Rename the file with `git mv`:

```bash
git mv content/articles/old-slug.md content/articles/new-slug.md
git commit -m "Rename article URL"
git push origin master
```

This changes the public URL from:

```text
/writing/old-slug/
```

to:

```text
/writing/new-slug/
```

GitHub Pages will not automatically redirect the old URL. Prefer keeping the
original filename after publication unless changing the URL is truly necessary.
If the URL must change, update every internal or external link you control.

## 9. Change topics, ordering, or featured presentation

Topics are derived entirely from the published article files. To add, rename,
or remove a topic, edit the comma-separated `topics` field on the relevant
articles. There is no separate topic index to maintain.

```yaml
topics: "engineering, game development, architecture"
```

A topic disappears from the homepage automatically when no published article
uses it.

To move an article higher or lower, change `order`. Lower values appear first:

```yaml
order: "5"
```

To use or remove the large article-card treatment, change `featured`:

```yaml
featured: "true"
```

Always preview layout changes when more than one article is featured.

## 10. Safer branch workflow for larger revisions

For a major article or uncertain changes, work on a separate branch:

```bash
git switch master
git pull origin master
git switch -c article/my-new-article
```

Commit and push the branch:

```bash
git add content/articles/my-new-article.md
git commit -m "Add draft of my new article"
git push -u origin article/my-new-article
```

Open a pull request on GitHub, review the diff, and merge it into `master` when
ready. Only pushes or merges into `master` trigger the Pages deployment.

## 11. Troubleshooting

### The article does not appear

Check all of the following:

- The file is inside `content/articles` and ends in `.md`.
- Its filename does not begin with `_`.
- `draft` is exactly `"false"`.
- The GitHub Actions deployment completed successfully.
- You are viewing the newest site version rather than a cached page.

### The build fails with missing frontmatter

Confirm that `title`, `description`, `category`, and `date` exist, are spelled
exactly as shown, and sit between the opening and closing `---` lines.

### The article URL returns 404

Confirm that the filename matches the slug exactly and the article is not a
draft. For `content/articles/my-post.md`, the URL is:

```text
https://karacanil.github.io/writing/my-post/
```

### A topic is duplicated

Use consistent spelling and capitalization in every article. `Linux` and
`linux` filter equivalently, but inconsistent display text makes maintenance
harder.

### The page looks wrong after publishing

Run `npm run dev` locally and check for unsupported Markdown or an unclosed code
fence. Also test long code lines and wide tables on mobile; they should scroll
horizontally inside their own content area.

### Git rejects the push

Another change may have reached `master`. Preserve your work, then rebase on the
latest branch:

```bash
git pull --rebase origin master
git push origin master
```

If Git reports a merge conflict, resolve the marked files, run the checks again,
then continue the rebase with `git rebase --continue`.

### GitHub Pages reports a temporary 503 error

A Pages `503` generally indicates a temporary GitHub service problem rather
than an article problem. Open the failed Actions run and re-run the failed jobs.
Check <https://www.githubstatus.com/> if it happens repeatedly.

## Publication checklist

- [ ] Filename is a clean, permanent URL slug.
- [ ] Required frontmatter is complete.
- [ ] Date and reading-time label are correct.
- [ ] Topics use consistent names.
- [ ] `order`, `accent`, and `featured` are intentional.
- [ ] Article has a strong opening paragraph.
- [ ] Only `##` and `###` are used for body headings.
- [ ] Links and images work.
- [ ] Images have descriptive alt text.
- [ ] Desktop and mobile previews look correct.
- [ ] `draft` is `"false"`.
- [ ] Lint, typecheck, and production build pass.
- [ ] Only intended files are staged.
- [ ] GitHub Actions deployment succeeds.
- [ ] The live article and its topic filters are tested.

