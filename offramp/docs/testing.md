# Build & Publish Docs

## Serve Locally

From the project root:

```bash
npm run docs:serve
```

Open `http://localhost:4000`. Uses [Honkit](https://github.com/honkit/honkit) (GitBook-compatible).

**Port conflict?** Kill the previous process:
```bash
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
