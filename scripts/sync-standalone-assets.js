#!/usr/bin/env node
"use strict";

const { existsSync, cpSync, rmSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const dist_dir = "next-output";
const next_standalone = join(root, dist_dir, "standalone");
const dist_standalone = join(root, "dist", "standalone");
const server_js = join(next_standalone, "server.js");

/**
 * Copies static and public assets into a standalone directory.
 * @param {string} standalone_dir
 */
function sync_assets_into(standalone_dir) {
  const static_src = join(root, dist_dir, "static");
  const static_dest = join(standalone_dir, dist_dir, "static");

  if (existsSync(static_src)) {
    cpSync(static_src, static_dest, { recursive: true });
  }

  const public_src = join(root, "public");
  const public_dest = join(standalone_dir, "public");

  if (existsSync(public_src)) {
    cpSync(public_src, public_dest, { recursive: true });
  }
}

if (!existsSync(server_js)) {
  console.error("`next-output/standalone` is missing. Run `pnpm build` first.");
  process.exit(1);
}

sync_assets_into(next_standalone);

if (existsSync(dist_standalone)) {
  rmSync(dist_standalone, { recursive: true, force: true });
}

cpSync(next_standalone, dist_standalone, { recursive: true });
