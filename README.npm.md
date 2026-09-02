# @traffic-arts/npm-static-demo

Single-file static HTML page hosted on npm — proof-of-concept for using the npm registry and its mirrors as free, trusted hosting for arbitrary HTML pages.

## What Is This

A Vite-built HTML page (all CSS, JS, and images inlined into one file) published to npm. Once live, mirrors like [unpkg](https://unpkg.com) and [npmmirror](https://npmmirror.com) serve it as a fully rendered page on a trusted domain with valid TLS and CDN caching.

This technique was documented by [OX Security](https://www.ox.security/blog/research-clickfix-phishing-npm-packages) in their ClickFix phishing research — 24 npm packages contained fake Cloudflare Captcha pages, served via unpkg on trusted domains.

## Access the Page

```
# unpkg
https://unpkg.com/@traffic-arts/npm-static-demo@1.0.0/index.html

# npmmirror
https://registry.npmmirror.com/@traffic-arts/npm-static-demo/1.0.0/files/index.html
```

Short URL (requires `unpkg` field in package.json):

```
https://unpkg.com/@traffic-arts/npm-static-demo@1.0.0
```

## How to Reproduce

1. Create a single `index.html` file
2. Create a minimal `package.json`:

```json
{
  "name": "@yourname/your-page",
  "version": "1.0.0",
  "files": ["index.html"],
  "unpkg": "./index.html",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

3. Publish:

```bash
npm publish --access public
```

4. Access via mirror URLs above (sync takes a few minutes).

## Repository

Source: [github.com/trafficarts/npm_static_demo](https://github.com/trafficarts/npm_static_demo)

More on [Traffic Arts channel](https://t.me/trafficarts)

## License

MIT
