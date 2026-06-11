import { loadSemester } from "./lib/config.mjs";
import { ghJson, runGh } from "./lib/gh.mjs";

const dryRun = !process.argv.includes("--apply");
const plan = loadSemester();

console.log(`${dryRun ? "Previewing" : "Syncing"} ${plan.weeks.length} milestones`);

let existingMilestones = [];
if (!dryRun) {
  existingMilestones = ghJson(["api", "--method", "GET", "repos/:owner/:repo/milestones", "--paginate", "-f", "state=all"]) ?? [];
}

for (const week of plan.weeks) {
  const dueOn = `${week.dueOn}T14:59:59Z`;
  const existing = existingMilestones.find((milestone) => milestone.title === week.title);

  if (existing) {
    runGh([
      "api",
      "--method",
      "PATCH",
      `repos/:owner/:repo/milestones/${existing.number}`,
      "-f",
      `title=${week.title}`,
      "-f",
      `due_on=${dueOn}`
    ], { dryRun });
  } else {
    runGh([
      "api",
      "--method",
      "POST",
      "repos/:owner/:repo/milestones",
      "-f",
      `title=${week.title}`,
      "-f",
      `due_on=${dueOn}`
    ], { dryRun });
  }
}

if (dryRun) {
  console.log("No milestones were changed. Re-run with --apply to write to GitHub.");
}
