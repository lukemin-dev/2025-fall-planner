import { spawnSync } from "node:child_process";

export function hasGh() {
  return spawnSync("gh", ["--version"], { stdio: "ignore" }).status === 0;
}

export function runGh(args, options = {}) {
  if (options.dryRun) {
    console.log(`DRY-RUN gh ${args.map(shellQuote).join(" ")}`);
    return "";
  }

  if (!hasGh()) {
    throw new Error("GitHub CLI(gh)가 필요합니다: https://cli.github.com/");
  }

  const result = spawnSync("gh", args, {
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || `gh ${args.join(" ")} failed`);
  }

  return result.stdout?.trim() ?? "";
}

export function ghJson(args) {
  const output = runGh(args, { capture: true });
  return output ? JSON.parse(output) : null;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:@=-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

