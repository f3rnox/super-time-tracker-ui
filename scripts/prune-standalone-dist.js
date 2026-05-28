#!/usr/bin/env node
'use strict'

const { existsSync, lstatSync, readdirSync, readlinkSync, rmSync, symlinkSync } = require('fs')
const { dirname, join, relative, resolve } = require('path')

const root = join(__dirname, '..')
const dist_standalone = join(root, 'dist', 'standalone')

const DOC_FILENAMES = new Set([
  'README.md',
  'readme.md',
  'CHANGELOG.md',
  'CHANGELOG',
  'HISTORY.md',
  'CONTRIBUTING.md',
])

const NEXT_DEV_RELATIVE_PATHS = [
  'node_modules/next/dist/docs',
  'node_modules/next/dist/bundle-analyzer',
  'node_modules/next/dist/next-devtools',
  'node_modules/next/dist/cli',
  'node_modules/next/dist/compiled/next-devtools',
  'node_modules/next/dist/compiled/react-dom-experimental',
  'node_modules/next/dist/compiled/react-dom',
  'node_modules/next/dist/compiled/webpack',
  'node_modules/next/dist/compiled/babel',
  'node_modules/next/dist/compiled/babel-packages',
  'node_modules/next/dist/compiled/terser',
  'node_modules/next/dist/compiled/@modelcontextprotocol',
  'node_modules/next/types',
  'node_modules/next/font',
  'node_modules/next/navigation-types',
  'node_modules/next/image-types',
  'node_modules/next/legacy',
  'node_modules/next/experimental',
  'node_modules/next/compat',
]

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
 * Deletes files with exact names under dir (depth-limited walk).
 * @param {string} dir
 * @param {Set<string>} filenames
 * @param {number} max_depth
 */
function remove_named_files(dir, filenames, max_depth) {
  if (max_depth < 0 || !existsSync(dir)) {
    return
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entry_path = join(dir, entry.name)

    if (entry.isDirectory()) {
      remove_named_files(entry_path, filenames, max_depth - 1)
      continue
    }

    if (entry.isFile() && filenames.has(entry.name)) {
      rmSync(entry_path, { force: true })
    }
  }
}

/**
 * Removes experimental bundles from next/dist/compiled.
 * @param {string} standalone_dir
 */
function remove_compiled_experimental(standalone_dir) {
  const compiled = join(
    standalone_dir,
    'node_modules',
    'next',
    'dist',
    'compiled',
  )

  if (!existsSync(compiled)) {
    return
  }

  for (const entry of readdirSync(compiled)) {
    if (entry.includes('experimental')) {
      rmSync(join(compiled, entry), { recursive: true, force: true })
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
    ...NEXT_DEV_RELATIVE_PATHS,
  ])

  remove_compiled_experimental(standalone_dir)
  remove_files_with_suffix(standalone_dir, '.map', 12)
  remove_files_with_suffix(standalone_dir, '.d.ts', 16)

  const node_modules = join(standalone_dir, 'node_modules')

  if (existsSync(node_modules)) {
    remove_named_files(node_modules, DOC_FILENAMES, 16)
  }

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
