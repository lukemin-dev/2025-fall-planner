import { loadSemester, plannedTasks, validateSemester } from "./lib/config.mjs";

const plan = loadSemester();
const errors = validateSemester(plan);

if (errors.length > 0) {
  console.error("Config validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`OK: ${plan.semester} / ${plan.weeks.length} weeks / ${plannedTasks(plan).length} planned tasks`);

