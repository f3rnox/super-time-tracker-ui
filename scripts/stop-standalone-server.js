#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const { join } = require("path");

const package_name = "super-time-tracker-ui";

/**
 * Stops node processes serving this package's standalone server (Windows file locks).
 */
function stop_standalone_server() {
  if (process.platform !== "win32") {
    return;
  }

  const script = [
    "Get-CimInstance Win32_Process -Filter \"name='node.exe'\"",
    `| Where-Object { $_.CommandLine -like '*${package_name}*standalone*server.js*' -or $_.CommandLine -like '*${package_name}*bin*stt-ui.js*' }`,
    "| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }",
  ].join(" ");

  try {
    execSync(`powershell -NoProfile -Command "${script}"`, { stdio: "ignore" });
  } catch {
    // no matching process
  }
}

stop_standalone_server();
