#!/usr/bin/env node
'use strict'

const { spawn } = require('child_process')
const { existsSync } = require('fs')
const http = require('http')
const { join } = require('path')

const root = join(__dirname, '..')
const { version } = require('../package.json')

if (process.argv.includes('--version') || process.argv.includes('-V')) {
  process.stdout.write(`${version}\n`)
  process.exit(0)
}

const standalone_dir = join(root, 'dist', 'standalone')
const server_js = join(standalone_dir, 'server.js')

if (!existsSync(server_js)) {
  console.error(
    'Production build not found. Run `pnpm build` in the project root.',
  )
  process.exit(1)
}

const port = process.env.PORT ?? '3000'
const hostname = process.env.STT_UI_HOSTNAME ?? '127.0.0.1'
const { HOSTNAME: _machine_hostname, ...env } = process.env

/**
 * Hostname suitable for URLs opened in a browser.
 * @param {string} bind_hostname
 * @returns {string}
 */
function browser_hostname(bind_hostname) {
  if (bind_hostname === '0.0.0.0' || bind_hostname === '::') {
    return '127.0.0.1'
  }

  if (bind_hostname === '[::]') {
    return '[::1]'
  }

  return bind_hostname
}

/**
 * Commands to open a URL, in fallback order.
 * @param {string} url
 * @returns {[string, string[]][]}
 */
function browser_openers(url) {
  if (process.platform === 'darwin') {
    return [['open', [url]]]
  }

  if (process.platform === 'win32') {
    return [['cmd', ['/c', 'start', '', url]]]
  }

  return [
    ['xdg-open', [url]],
    ['wslview', [url]],
    ['sensible-browser', [url]],
  ]
}

/**
 * Opens a URL in the system default browser; no-op if no opener is available.
 * @param {string} url
 */
function open_browser(url) {
  const openers = browser_openers(url)
  let index = 0

  const try_next = () => {
    if (index >= openers.length) {
      return
    }

    const [command, args] = openers[index]
    index += 1

    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    })

    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        try_next()
      }
    })

    child.unref()
  }

  try_next()
}

/**
 * Calls callback once the server responds at url.
 * @param {string} url
 * @param {() => void} on_ready
 */
function wait_for_server(url, on_ready) {
  const max_attempts = 50
  let attempts = 0
  let opened = false

  const try_once = () => {
    const req = http.get(url, (res) => {
      res.resume()

      if (!opened) {
        opened = true
        on_ready()
      }
    })

    req.setTimeout(1000, () => {
      req.destroy()
    })

    req.on('error', () => {
      attempts += 1

      if (attempts < max_attempts) {
        setTimeout(try_once, 200)
      }
    })
  }

  try_once()
}

const should_open_browser =
  !process.argv.includes('--no-open') &&
  process.env.STT_UI_OPEN_BROWSER !== '0' &&
  process.env.STT_UI_OPEN_BROWSER !== 'false'

const app_url = `http://${browser_hostname(hostname)}:${port}`

const child = spawn(process.execPath, [server_js], {
  cwd: standalone_dir,
  env: {
    ...env,
    NODE_ENV: 'production',
    HOSTNAME: hostname,
    PORT: port,
  },
  stdio: 'inherit',
})

if (should_open_browser) {
  wait_for_server(app_url, () => {
    open_browser(app_url)
  })
}

child.on('exit', (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

console.error(`stt-ui listening on ${app_url}`)
