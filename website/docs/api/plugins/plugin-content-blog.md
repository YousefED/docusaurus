---
id: plugin-content-blog
title: '📦 plugin-content-blog'
slug: '/api/plugins/@docusaurus/plugin-content-blog'
---

Provides the [Blog](blog.mdx) feature and is the default blog plugin for Docusaurus.

## Installation {#installation}

```bash npm2yarn
npm install --save @docusaurus/plugin-content-blog
```

:::tip

If you use the preset `@docusaurus/preset-classic`, you don't need to install this plugin as a dependency.

You can configure this plugin through the [preset options](#ex-config-preset).

:::

## Configuration {#configuration}

Accepted fields:

<small>

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | `string` | `'blog'` | Path to the blog content directory on the filesystem, relative to site dir. |
| `editUrl` | <code>string \| EditUrlFunction</code> | `undefined` | Base URL to edit your site. The final URL is computed by `editUrl + relativeDocPath`. Using a function allows more nuanced control for each file. Omitting this variable entirely will disable edit links. |
| `editLocalizedFiles` | `boolean` | `false` | The edit URL will target the localized file, instead of the original unlocalized file. Ignored when `editUrl` is a function. |
| `blogTitle` | `string` | `'Blog'` | Blog page title for better SEO. |
| `blogDescription` | `string` | `'Blog'` | Blog page meta description for better SEO. |
| `blogSidebarCount` | <code>number \| 'ALL'</code> | `5` | Number of blog post elements to show in the blog sidebar. `'ALL'` to show all blog posts; `0` to disable |
| `blogSidebarTitle` | `string` | `'Recent posts'` | Title of the blog sidebar. |
| `routeBasePath` | `string` | `'blog'` | URL route for the blog section of your site. **DO NOT** include a trailing slash. Use `/` to put the blog at root path. |
| `tagsBasePath` | `string` | `'tags'` | URL route for the tags list page of your site. It is prepended to the `routeBasePath`. |
| `archiveBasePath` | `string` | `'/archive'` | URL route for the archive blog section of your site. It is prepended to the `routeBasePath`. **DO NOT** include a trailing slash. |
| `include` | `string[]` | `['**/*.{md,mdx}']` | Matching files will be included and processed. |
| `exclude` | `string[]` | _See example configuration_ | No route will be created for matching files. |
| `postsPerPage` | <code>number \| 'ALL'</code> | `10` | Number of posts to show per page in the listing page. Use `'ALL'` to display all posts on one listing page. |
| `blogListComponent` | `string` | `'@theme/BlogListPage'` | Root component of the blog listing page. |
| `blogPostComponent` | `string` | `'@theme/BlogPostPage'` | Root component of each blog post page. |
| `blogTagsListComponent` | `string` | `'@theme/BlogTagsListPage'` | Root component of the tags list page |
| `blogTagsPostsComponent` | `string` | `'@theme/BlogTagsPostsPage'` | Root component of the "posts containing tag" page. |
| `remarkPlugins` | `any[]` | `[]` | Remark plugins passed to MDX. |
| `rehypePlugins` | `any[]` | `[]` | Rehype plugins passed to MDX. |
| `beforeDefaultRemarkPlugins` | `any[]` | `[]` | Custom Remark plugins passed to MDX before the default Docusaurus Remark plugins. |
| `beforeDefaultRehypePlugins` | `any[]` | `[]` | Custom Rehype plugins passed to MDX before the default Docusaurus Rehype plugins. |
| `truncateMarker` | `string` | `/<!--\s*(truncate)\s*-->/` | Truncate marker, can be a regex or string. |
| `showReadingTime` | `boolean` | `true` | Show estimated reading time for the blog post. |
| `readingTime` | `ReadingTimeFunctionOption` | The default reading time | A callback to customize the reading time number displayed. |
| `authorsMapPath` | `string` | `'authors.yml'` | Path to the authors map file, relative to the blog content directory specified with `path`. Can also be a `json` file. |
| `feedOptions` | _See below_ | `{type: ['rss', 'atom']}` | Blog feed. If undefined, no rss feed will be generated. |
| `feedOptions.type` | <code>'rss' \| 'atom' \| 'all'</code> (or array of multiple options) | **Required** | Type of feed to be generated. |
| `feedOptions.title` | `string` | `siteConfig.title` | Title of the feed. |
| `feedOptions.description` | `string` | <code>\`${siteConfig.title} Blog\`</code> | Description of the feed. |
| `feedOptions.copyright` | `string` | `undefined` | Copyright message. |
| `feedOptions.language` | `string` (See [documentation](http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes) for possible values) | `undefined` | Language metadata of the feed. |
| `sortPosts` | <code>'descending' \| 'ascending' </code> | `'descending'` | Governs the direction of blog post sorting. |

</small>

```typescript
type EditUrlFunction = (params: {
  blogDirPath: string;
  blogPath: string;
  permalink: string;
  locale: string;
}) => string | undefined;

type ReadingTimeOptions = {
  wordsPerMinute: number;
  wordBound: (char: string) => boolean;
};

type ReadingTimeFunction = (params: {
  content: string;
  frontMatter?: BlogPostFrontMatter & Record<string, unknown>;
  options?: ReadingTimeOptions;
}) => number;

type ReadingTimeFunctionOption = (params: {
  content: string;
  frontMatter: BlogPostFrontMatter & Record<string, unknown>;
  defaultReadingTime: ReadingTimeFunction;
}) => number | undefined;
```

## Example configuration {#ex-config}

Here's an example configuration object.

You can provide it as [preset options](#ex-config-preset) or [plugin options](#ex-config-plugin).

:::tip

Most Docusaurus users configure this plugin through the [preset options](#ex-config-preset).

:::

```js
const config = {
  path: 'blog',
  // Simple use-case: string editUrl
  // editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
  // Advanced use-case: functional editUrl
  editUrl: ({locale, blogDirPath, blogPath, permalink}) => {
    return `https://github.com/facebook/docusaurus/edit/main/website/${blogDirPath}/${blogPath}`;
  },
  editLocalizedFiles: false,
  blogTitle: 'Blog title',
  blogDescription: 'Blog',
  blogSidebarCount: 5,
  blogSidebarTitle: 'All our posts',
  routeBasePath: 'blog',
  include: ['**/*.{md,mdx}'],
  exclude: [
    '**/_*.{js,jsx,ts,tsx,md,mdx}',
    '**/_*/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/__tests__/**',
  ],
  postsPerPage: 10,
  blogListComponent: '@theme/BlogListPage',
  blogPostComponent: '@theme/BlogPostPage',
  blogTagsListComponent: '@theme/BlogTagsListPage',
  blogTagsPostsComponent: '@theme/BlogTagsPostsPage',
  remarkPlugins: [require('remark-math')],
  rehypePlugins: [],
  beforeDefaultRemarkPlugins: [],
  beforeDefaultRehypePlugins: [],
  truncateMarker: /<!--\s*(truncate)\s*-->/,
  showReadingTime: true,
  feedOptions: {
    type: '',
    title: '',
    description: '',
    copyright: '',
    language: undefined,
  },
};
```

### Preset options {#ex-config-preset}

If you use a preset, configure this plugin through the [preset options](presets.md#docusauruspreset-classic):

```js title="docusaurus.config.js"
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        // highlight-start
        blog: {
          path: 'blog',
          // ... configuration object here
        },
        // highlight-end
      },
    ],
  ],
};
```

### Plugin options {#ex-config-plugin}

If you are using a standalone plugin, provide options directly to the plugin:

```js title="docusaurus.config.js"
module.exports = {
  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      // highlight-start
      {
        path: 'blog',
        // ... configuration object here
      },
      // highlight-end
    ],
  ],
};
```

## Markdown Frontmatter {#markdown-frontmatter}

Markdown documents can use the following Markdown FrontMatter metadata fields, enclosed by a line `---` on either side.

Accepted fields:

<small>

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `authors` | `Authors` | `undefined` | List of blog post authors (or unique author). Read the [`authors` guide](../../blog.mdx#blog-post-authors) for more explanations. Prefer `authors` over the `author_*` FrontMatter fields, even for single author blog posts. |
| `author` | `string` | `undefined` | ⚠️ Prefer using `authors`. The blog post author's name. |
| `author_url` | `string` | `undefined` | ⚠️ Prefer using `authors`. The URL that the author's name will be linked to. This could be a GitHub, Twitter, Facebook profile URL, etc. |
| `author_image_url` | `string` | `undefined` | ⚠️ Prefer using `authors`. The URL to the author's thumbnail image. |
| `author_title` | `string` | `undefined` | ⚠️ Prefer using `authors`. A description of the author. |
| `title` | `string` | Markdown title | The blog post title. |
| `date` | `string` | File name or file creation time | The blog post creation date. If not specified, this can be extracted from the file or folder name, e.g, `2021-04-15-blog-post.mdx`, `2021-04-15-blog-post/index.mdx`, `2021/04/15/blog-post.mdx`. Otherwise, it is the Markdown file creation time. |
| `tags` | `Tag[]` | `undefined` | A list of strings or objects of two string fields `label` and `permalink` to tag to your post. |
| `draft` | `boolean` | `false` | A boolean flag to indicate that the blog post is work-in-progress and therefore should not be published yet. However, draft blog posts will be displayed during development. |
| `hide_table_of_contents` | `boolean` | `false` | Whether to hide the table of contents to the right. |
| `toc_min_heading_level` | `number` | `2` | The minimum heading level shown in the table of contents. Must be between 2 and 6 and lower or equal to the max value. |
| `toc_max_heading_level` | `number` | `3` | The max heading level shown in the table of contents. Must be between 2 and 6. |
| `keywords` | `string[]` | `undefined` | Keywords meta tag, which will become the `<meta name="keywords" content="keyword1,keyword2,..."/>` in `<head>`, used by search engines. |
| `description` | `string` | The first line of Markdown content | The description of your document, which will become the `<meta name="description" content="..."/>` and `<meta property="og:description" content="..."/>` in `<head>`, used by search engines. |
| `image` | `string` | `undefined` | Cover or thumbnail image that will be used when displaying the link to your post. |
| `slug` | `string` | File path | Allows to customize the blog post url (`/<routeBasePath>/<slug>`). Support multiple patterns: `slug: my-blog-post`, `slug: /my/path/to/blog/post`, slug: `/`. |

</small>

```typescript
type Tag = string | {label: string; permalink: string};

// An author key references an author from the global plugin authors.yml file
type AuthorKey = string;

type Author = {
  key?: AuthorKey;
  name: string;
  title?: string;
  url?: string;
  image_url?: string;
};

// The FrontMatter authors field allows various possible shapes
type Authors = AuthorKey | Author | (AuthorKey | Author)[];
```

Example:

```yml
---
title: Welcome Docusaurus v2
authors:
  - slorber
  - yangshun
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
tags: [hello, docusaurus-v2]
description: This is my first post on Docusaurus 2.
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---
A Markdown blog post
```

## i18n {#i18n}

Read the [i18n introduction](../../i18n/i18n-introduction.md) first.

### Translation files location {#translation-files-location}

- **Base path**: `website/i18n/<locale>/docusaurus-plugin-content-blog`
- **Multi-instance path**: `website/i18n/<locale>/docusaurus-plugin-content-blog-<pluginId>`
- **JSON files**: extracted with [`docusaurus write-translations`](../../cli.md#docusaurus-write-translations-sitedir)
- **Markdown files**: `website/i18n/<locale>/docusaurus-plugin-content-blog`

### Example file-system structure {#example-file-system-structure}

```bash
website/i18n/<locale>/docusaurus-plugin-content-blog
│
│ # translations for website/blog
├── authors.yml
├── first-blog-post.md
├── second-blog-post.md
│
│ # translations for the plugin options that will be rendered
└── options.json
```
