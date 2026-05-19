#!/usr/bin/env node
'use strict'

const { existsSync, lstatSync, readdirSync, readlinkSync, rmSync, symlinkSync } = require('fs')
const { dirname, join, relative, resolve } = require('path')

const root = join(__dirname, '..')
const dist_standalone = join(root, 'dist', 'standalone')

/**
 * Removes paths under standalone_dir when they exist.
 * @param {string} standalone_dir
 * @param {string[]} relative_paths
 */
function remove_paths(standalone_dir, relative_paths) {
  for (const relative_path of relative_paths) {
    const absolute_path = join(standalone_dir, relative_path)

    if (existsSync(absolute_path)) {
      rmSync(absolute_path, { recursive: true, force: true })
    }
  }
}

/**
 * Deletes files ending with suffix under dir (depth-limited walk).
 * @param {string} dir
 * @param {string} suffix
 * @param {number} max_depth
 */
function remove_files_with_suffix(dir, suffix, max_depth) {
  if (max_depth < 0 || !existsSync(dir)) {
    return
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entry_path = join(dir, entry.name)

    if (entry.isDirectory()) {
      remove_files_with_suffix(entry_path, suffix, max_depth - 1)
      continue
    }

    if (entry.isFile() && entry.name.endsWith(suffix)) {
      rmSync(entry_path, { force: true })
    }
  }
}

/**
 * Rewrites node_modules symlinks so targets stay inside the standalone tree (npm-safe).
 * @param {string} standalone_dir
 */
function rewrite_node_modules_symlinks(standalone_dir) {
  const node_modules = join(standalone_dir, 'node_modules')

  if (!existsSync(node_modules)) {
    return
  }

  const marker = `${join('node_modules', '.pnpm')}`

  for (const name of readdirSync(node_modules)) {
    const entry_path = join(node_modules, name)

    if (!lstatSync(entry_path).isSymbolicLink()) {
      continue
    }

    const target = readlinkSync(entry_path)
    let resolved = resolve(dirname(entry_path), target)
    const marker_index = resolved.indexOf(marker)

    if (marker_index !== -1) {
      resolved = join(
        standalone_dir,
        resolved.slice(marker_index),
      )
    }

    const relative_target = relative(dirname(entry_path), resolved)

    rmSync(entry_path)
    symlinkSync(relative_target, entry_path)
  }
}

/**
 * Drops optional native and dev-only artifacts from the publishable standalone tree.
 * @param {string} standalone_dir
 */
function prune_standalone_dist(standalone_dir) {
  rewrite_node_modules_symlinks(standalone_dir)
  const pnpm_dir = join(standalone_dir, 'node_modules', '.pnpm')

  if (existsSync(pnpm_dir)) {
    for (const entry of readdirSync(pnpm_dir)) {
      if (
        entry.startsWith('@img+') ||
        entry.startsWith('sharp@') ||
        entry.startsWith('detect-libc@')
      ) {
        rmSync(join(pnpm_dir, entry), { recursive: true, force: true })
      }
    }
  }

  remove_paths(standalone_dir, [
    'node_modules/sharp',
    'node_modules/@img',
  ])

  remove_files_with_suffix(standalone_dir, '.map', 12)

  const compiled_server = join(
    standalone_dir,
    'node_modules',
    'next',
    'dist',
    'compiled',
    'next-server',
  )

  if (existsSync(compiled_server)) {
    for (const entry of readdirSync(compiled_server)) {
      if (entry.includes('-experimental.runtime.prod.js')) {
        rmSync(join(compiled_server, entry), { force: true })
      }
    }
  }
}

if (!existsSync(join(dist_standalone, 'server.js'))) {
  console.error('`dist/standalone` is missing. Run `pnpm build` first.')
  process.exit(1)
}

prune_standalone_dist(dist_standalone)
