#!/usr/bin/env node
'use strict'

const { spawn } = require('child_process')
const { existsSync, cpSync } = require('fs')
const { join } = require('path')

const root = join(__dirname, '..')
const standalone_dir = join(root, '.next', 'standalone')
const server_js = join(standalone_dir, 'server.js')

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

if (!existsSync(server_js)) {
  console.error(
    'Standalone build not found. Run `pnpm build` first, then `stt-ui`.',
  )
  process.exit(1)
}

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
