import {
  buildIssueBody,
  buildIssueTitle,
  loadSemester,
  plannedTasks,
  validateSemester
} from "./lib/config.mjs";
import { ghJson, runGh } from "./lib/gh.mjs";

const dryRun = !process.argv.includes("--apply");
const weekFilter = readArg("--week");
const plan = loadSemester();
const errors = validateSemester(plan);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const tasks = plannedTasks(plan, weekFilter);
if (weekFilter && tasks.length === 0) {
  console.error(`No tasks found for week: ${weekFilter}`);
  process.exit(1);
}

let existingIssues = [];
if (!dryRun) {
  existingIssues = ghJson(["issue", "list", "--state", "all", "--limit", "200", "--json", "number,title"]) ?? [];
}

console.log(`${dryRun ? "Previewing" : "Creating"} ${tasks.length} issues`);

for (const task of tasks) {
  const title = buildIssueTitle(task);
  const body = buildIssueBody(task);
  const duplicate = existingIssues.find((issue) => issue.title === title);

  if (duplicate) {
    console.log(`SKIP #${duplicate.number}: ${title}`);
    continue;
  }

  const args = [
    "issue",
    "create",
    "--title",
    title,
    "--body",
    body,
    "--milestone",
    task.week.title
  ];

  for (const label of task.labels) {
    args.push("--label", label);
  }

  runGh(args, { dryRun });
}

if (dryRun) {
  console.log("No issues were created. Re-run with --apply to write to GitHub.");
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

