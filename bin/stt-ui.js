#!/usr/bin/env node
'use strict'

const { spawn, spawnSync } = require('child_process')
const { existsSync, cpSync, unlinkSync } = require('fs')
const { join } = require('path')

const root = join(__dirname, '..')
const standalone_dir = join(root, '.next', 'standalone')
const server_js = join(standalone_dir, 'server.js')
const build_lock = join(root, '.next', 'lock')

/**
 * Copies build artifacts required by the Next.js standalone server.
 */
function sync_standalone_assets() {
  const static_src = join(root, '.next', 'static')
  const static_dest = join(standalone_dir, '.next', 'static')

  if (existsSync(static_src)) {
    cpSync(static_src, static_dest, { recursive: true })
  }

  const public_src = join(root, 'public')
  const public_dest = join(standalone_dir, 'public')

  if (existsSync(public_src)) {
    cpSync(public_src, public_dest, { recursive: true })
  }
}

/**
 * Runs `next build` when the standalone server bundle is missing.
 */
function ensure_standalone_build() {
  if (existsSync(server_js)) {
    return
  }

  if (existsSync(build_lock)) {
    console.error('Removing stale Next.js build lock…')
    unlinkSync(build_lock)
  }

  console.error('Production build not found. Running `next build`…')

  const next_bin = require.resolve('next/dist/bin/next')
  const result = spawnSync(process.execPath, [next_bin, 'build'], {
    cwd: root,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  if (!existsSync(server_js)) {
    console.error('Build finished but standalone server.js is still missing.')
    process.exit(1)
  }
}

ensure_standalone_build()
sync_standalone_assets()

const port = process.env.PORT ?? '3000'
const hostname = process.env.HOSTNAME ?? '127.0.0.1'

const child = spawn(process.execPath, [server_js], {
  cwd: standalone_dir,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    HOSTNAME: hostname,
    PORT: port,
  },
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

console.error(`stt-ui listening on http://${hostname}:${port}`)
