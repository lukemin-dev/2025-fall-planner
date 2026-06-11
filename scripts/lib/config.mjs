import fs from "node:fs";
import path from "node:path";

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadSemester(rootDir = process.cwd()) {
  return readJson(path.join(rootDir, "config", "semester.json"));
}

export function loadLabels(rootDir = process.cwd()) {
  return readJson(path.join(rootDir, "labels.json"));
}

export function validateSemester(plan) {
  const errors = [];
  const courseNames = new Set((plan.courses ?? []).map((course) => course.name));
  const taskTypes = new Set(plan.taskTypes ?? []);
  const weekIds = new Set();

  if (!plan.semester) errors.push("semester is required");
  if (!plan.timezone) errors.push("timezone is required");
  if (!Array.isArray(plan.courses) || plan.courses.length === 0) errors.push("courses must not be empty");
  if (!Array.isArray(plan.weeks) || plan.weeks.length === 0) errors.push("weeks must not be empty");

  for (const week of plan.weeks ?? []) {
    if (!week.id) errors.push("week id is required");
    if (weekIds.has(week.id)) errors.push(`duplicate week id: ${week.id}`);
    weekIds.add(week.id);

    if (!week.title) errors.push(`week ${week.id} title is required`);
    if (!isDate(week.startsOn)) errors.push(`week ${week.id} startsOn must be YYYY-MM-DD`);
    if (!isDate(week.dueOn)) errors.push(`week ${week.id} dueOn must be YYYY-MM-DD`);

    for (const task of week.tasks ?? []) {
      if (!task.title) errors.push(`task title is required in ${week.id}`);
      if (!courseNames.has(task.course)) errors.push(`unknown course in ${week.id}: ${task.course}`);
      if (!taskTypes.has(task.type)) errors.push(`unknown task type in ${week.id}: ${task.type}`);
      if (!isDate(task.due)) errors.push(`task due must be YYYY-MM-DD in ${week.id}: ${task.title}`);
    }
  }

  return errors;
}

export function plannedTasks(plan, weekFilter = null) {
  const courseByName = new Map(plan.courses.map((course) => [course.name, course]));
  return plan.weeks
    .filter((week) => !weekFilter || week.id === weekFilter || week.title === weekFilter)
    .flatMap((week) => (week.tasks ?? []).map((task) => ({
      ...task,
      week,
      estimateMinutes: task.estimateMinutes ?? plan.defaultEstimateMinutes ?? 90,
      labels: ["study", courseByName.get(task.course)?.label ?? task.course, task.type]
    })));
}

export function buildIssueTitle(task) {
  return `[${task.course}] ${task.title}`;
}

export function buildIssueBody(task) {
  const goals = (task.goals ?? ["학습 목표를 구체화하기"])
    .map((goal) => `- [ ] ${goal}`)
    .join("\n");

  return [
    `### 과목`,
    task.course,
    "",
    `### 작업 유형`,
    task.type,
    "",
    `### 목표`,
    goals,
    "",
    `### 일정`,
    `- 📅 마감일: ${task.due}`,
    `- ⏱ 예상시간: ${task.estimateMinutes}분`,
    `- 마일스톤: ${task.week.title}`,
    "",
    `### 회고`,
    `- 막힌 부분:`,
    `- 다음 액션:`
  ].join("\n");
}

function isDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

