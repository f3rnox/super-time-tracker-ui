#!/usr/bin/env node
'use strict'

const { existsSync, cpSync } = require('fs')
const { join } = require('path')

const root = join(__dirname, '..')
const standalone_dir = join(root, '.next', 'standalone')

/**
 * Copies static and public assets into the Next.js standalone output directory.
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

sync_standalone_assets()
