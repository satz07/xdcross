# Build & Publish Docs

## Serve Locally

From the project root:

```bash
npm run docs:serve
```

Open **http://localhost:4000**. Uses [Honkit](https://github.com/honkit/honkit) (GitBook-compatible).

**Port 4000 already in use?** Run on another port:

```bash
cd docs && npx honkit serve --port 4001
```

Then open `http://localhost:4001`.

**Port conflict (e.g. livereload)?** Kill the process using the port:

```bash
lsof -ti :4000 | xargs kill -9
# or livereload default 35729:
lsof -ti :35729 | xargs kill -9
```

## Build Static HTML

```bash
npm run docs:build
# Output in _book/
```

## Publish to GitBook.com

1. Push the repo to GitHub
2. Go to [gitbook.com](https://www.gitbook.com)
3. Create a new space and connect your repo
4. Set the root path to `docs`
5. GitBook will auto-sync and publish
