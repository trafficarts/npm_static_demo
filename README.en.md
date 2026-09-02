[Русская версия](./README.md) | More on [Traffic Arts channel](https://t.me/trafficarts)

# Hosting Arbitrary Pages on npm

A proof-of-concept demonstrating how the npm registry and its mirrors can be used as free, trusted hosting for arbitrary HTML pages.

## Why This Works

The npm registry is designed for distributing JavaScript packages. But there's nothing stopping you from publishing a package that contains an HTML page instead of (or alongside) code. Once published, mirrors like [unpkg](https://unpkg.com), [npmmirror](https://npmmirror.com), and others automatically serve your files — including rendering HTML directly in the browser.

The result: a fully functional HTML page, hosted on a trusted domain, with valid TLS, CDN caching, and zero infrastructure cost on your end.

This is exactly what [OX Security documented](https://www.ox.security/blog/research-clickfix-phishing-npm-packages) in their ClickFix phishing research — threat actors published 24 npm packages containing fake Cloudflare Captcha pages, then used unpkg and other mirrors to serve those pages on trusted domains. Installing the packages is harmless; the attack happens when someone opens the mirror URL in a browser.

## How It Works (Step by Step)

### 1. Create Your Page

Write a single HTML page, or build one with Vite/webpack/etc. The only requirement: the final artifact must be an `index.html` file.

### 2. Prepare the npm Package

Create a minimal `package.json`:

```json
{
  "name": "@yourname/your-package",
  "version": "1.0.0",
  "description": "Your page description",
  "license": "MIT",
  "files": [
    "index.html"
  ],
  "unpkg": "./index.html",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

Key fields:

- **`files`**: Only include `index.html`. No source code, no extra files — just the page.
- **`unpkg`**: Tells unpkg which file to serve when someone visits the package URL without specifying a filename.
- **`publishConfig.access`**: Set to `public` so it's immediately visible on mirrors.

### 3. Publish

```bash
# Log in to npm
npm login

# Publish from the directory containing package.json and index.html
npm publish --access public
```

That's it. No build step, no CI pipeline, no infrastructure. A single command.

### 4. Access Your Page

Once published (usually within seconds to a few minutes on mirrors):

```
# unpkg (serves HTML directly)
https://unpkg.com/@yourname/your-package@1.0.0/index.html

# npmmirror
https://registry.npmmirror.com/@yourname/your-package/1.0.0/files/index.html
```

If you set the `unpkg` field in `package.json`, the short URL also works:

```
https://unpkg.com/@yourname/your-package@1.0.0
```

## This Repository

This repo automates the above with a Vite build pipeline that produces a self-contained single-file HTML page (all CSS, JS, and images inlined) and publishes it to npm via GitHub Actions.

### Build Pipeline

`npm run build` does the following:

1. **Vite** bundles JS and CSS with production minification.
2. **`vite-plugin-singlefile`** inlines all JS and CSS into `index.html`, removing separate bundle files.
3. **Images** imported with `?inline` are embedded as `data:image/webp;base64,...` URIs.
4. **`html-minifier-terser`** compresses the resulting HTML, inline CSS, and inline JS.
5. **`package.publish.json`** is copied to `dist/package.json` — this is the metadata that gets published.

The `dist/` directory ends up with exactly two files:

```
dist/
├── index.html      # HTML + inlined CSS + inlined JS + images as data: URIs
└── package.json    # npm package metadata
```

### Publishing

**Via Git tag (recommended):**

```bash
git tag v1.0.1
git push origin main --tags
```

The `publish.yml` GitHub Action builds the page and runs `npm publish`.

**Via GitHub Actions UI:**

Go to Actions → Publish to npm → Run workflow. The version from `package.publish.json` will be published.

**npm authentication**: the first publish requires a GitHub `NPM_TOKEN` secret with publish permission and 2FA bypass. Once the package exists, configure an npm [Trusted Publisher](https://www.npmjs.com) for GitHub Actions: repository `trafficarts/npm_static_demo`, workflow filename `publish.yml`, and the `npm publish` allowed action. Then remove `NPM_TOKEN`; the workflow publishes through OIDC. The packed `package.json` already identifies this exact GitHub repository.

### Project Structure

```
index.html                    HTML template
src/main.js                   Page logic
src/config.js                 Runtime config via VITE_* variables
src/style.css                 Styles
src/assets/image.webp         Image
vite.config.js                Vite + single-file build
scripts/minify-html.mjs       HTML minification
package.publish.json          Metadata for the published npm package
.github/workflows/ci.yml      Build verification on push/PR
.github/workflows/publish.yml npm publish on tag or manual trigger
```

### Local Development

```bash
npm install
npm run dev          # dev server
npm run build        # production build
npm run pack:check   # inspect what would be published
```

### CI (build verification only)

```bash
npm run ci:local     # runs the same CI workflow via nektos/act
```

This requires Docker and `act` (`brew install act`). It executes the same GitHub Actions workflow locally — install, build, `npm pack --dry-run` — without publishing anything.

## What This Means for Security

npm is free to register and free to publish. Mirrors are free to serve. HTML pages render in browsers with no warnings. The URL inherits the trust of the hosting domain (unpkg.com, etc.).

For defenders, this means:

- Treat npm mirror domains as potential phishing hosts when not used for package downloads.
- Add mirror URLs to phishing detection and URL-reputation pipelines.
- Monitor proxy and DNS logs for direct `.html` requests to mirror domains.

For everyone else, this is a reminder that **supply chain security extends beyond code execution**. A package doesn't need to run `postinstall` scripts or import native modules to be dangerous — it just needs to contain an HTML file.

## References

- [ClickFix Phishing Pages Discovered in 24 npm Packages — OX Security](https://www.ox.security/blog/research-clickfix-phishing-npm-packages)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [Vite Asset Inlining](https://vite.dev/guide/assets.html#explicit-inline-handling)
- [GitHub Actions: Publishing npm packages](https://docs.github.com/actions/tutorials/publish-packages/publish-nodejs-packages)

## License

MIT
