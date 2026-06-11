import { loadLabels } from "./lib/config.mjs";
import { runGh } from "./lib/gh.mjs";

const dryRun = !process.argv.includes("--apply");
const labels = loadLabels();

console.log(`${dryRun ? "Previewing" : "Syncing"} ${labels.length} labels`);

for (const label of labels) {
  runGh(["label", "create", label.name, "--color", label.color, "--force"], { dryRun });
}

if (dryRun) {
  console.log("No labels were changed. Re-run with --apply to write to GitHub.");
}

