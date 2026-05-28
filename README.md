# super-time-tracker-ui

Web UI for
[super-time-tracker](https://github.com/f3rnox/super-time-tracker) time sheets.
The npm package ships a standalone Next.js build and the `stt-ui` CLI to run it
locally.

Requires Node.js 20 or newer.

## Install

```bash
npm install -g super-time-tracker-ui
```

Then start the UI:

```bash
stt-ui
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (default port).

`stt-ui --version` prints the installed package version.

On start, the default browser opens at the server URL. Pass `--no-open` or set
`STT_UI_OPEN_BROWSER=0` to skip that.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `STT_UI_HOSTNAME` | `127.0.0.1` | Bind address and URL shown in the terminal |
| `STT_UI_OPEN_BROWSER` | enabled | Set to `0` or `false` to disable auto-open |

The CLI ignores the shell `HOSTNAME` variable (on WSL it is often the Windows
machine name).

Examples:

```bash
PORT=8080 stt-ui
STT_UI_HOSTNAME=0.0.0.0 stt-ui
stt-ui --no-open
```

## Development

Clone the repo and install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

`pnpm build` produces a standalone app under `dist/standalone`. Build output
uses `next-output/` as the Next.js dist directory. Post-build scripts copy
static assets into the standalone tree and prune the publish bundle.

Run the production server from the repo:

```bash
pnpm build
pnpm stt-ui
```

`pnpm start` runs `next start` against the project root and is mainly for local
Next.js workflows. The published package uses `stt-ui` and the standalone
output instead.

## Publishing

`prepublishOnly` runs `pnpm build`. The published tarball includes
`bin/stt-ui.js` and `dist/standalone` only.

## License

MIT
