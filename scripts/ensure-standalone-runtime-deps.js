#!/usr/bin/env node
"use strict";

const { cpSync, existsSync, mkdirSync } = require("fs");
const { dirname, join } = require("path");

const root = join(__dirname, "..");
const dist_standalone = join(root, "dist", "standalone");

/** Next standalone traces can omit pnpm hoisted runtime deps; copy these explicitly. */
const RUNTIME_PACKAGES = ["@swc/helpers", "@next/env"];

/**
 * Resolves install path for a package name under node_modules.
 * @param {string} package_name
 * @param {string} node_modules_root
 * @returns {string}
 */
function package_source_path(package_name, node_modules_root) {
  if (package_name.startsWith("@")) {
    const slash_index = package_name.indexOf("/");
    const scope = package_name.slice(0, slash_index);
    const name = package_name.slice(slash_index + 1);

    return join(node_modules_root, scope, name);
  }

  return join(node_modules_root, package_name);
}

/**
 * Copies a package into standalone node_modules when file tracing did not include it.
 * @param {string} package_name
 * @param {string} standalone_dir
 * @param {string} project_root
 */
function ensure_runtime_package(package_name, standalone_dir, project_root) {
  const src = package_source_path(
    package_name,
    join(project_root, "node_modules"),
  );
  const dest = package_source_path(
    package_name,
    join(standalone_dir, "node_modules"),
  );

  if (existsSync(dest)) {
    return;
  }

  if (!existsSync(src)) {
    console.error(
      `Runtime dependency "${package_name}" is missing at ${src}. Install it in the project root.`,
    );
    process.exit(1);
  }

  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true, dereference: true, force: true });
  console.error(
    `Copied runtime dependency ${package_name} into standalone bundle`,
  );
}

if (!existsSync(join(dist_standalone, "server.js"))) {
  console.error("`dist/standalone` is missing. Run `pnpm build` first.");
  process.exit(1);
}

for (const package_name of RUNTIME_PACKAGES) {
  ensure_runtime_package(package_name, dist_standalone, root);
}
