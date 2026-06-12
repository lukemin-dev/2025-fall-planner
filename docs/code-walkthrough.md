# 2025-Fall Planner Code Walkthrough

이 문서는 `2025-fall-planner` 코드를 처음 읽는 사람을 위한 공부용 설명입니다. 목표는 "설정 파일에 적은 과제가 어떻게 GitHub 라벨, 마일스톤, 이슈로 바뀌는지"를 이해하는 것입니다.

## 1. 프로젝트가 하는 일

이 저장소는 학기 공부 계획을 GitHub Issues로 관리하기 위한 자동화 도구입니다.

```text
config/semester.json에 과목과 과제 작성
-> scripts가 설정을 읽음
-> GitHub 라벨 생성
-> GitHub 마일스톤 생성
-> 주차별 이슈 생성
```

중요한 포인트는 `--apply`입니다.

```text
--apply 없음  -> 미리보기만 합니다.
--apply 있음  -> 실제 GitHub에 반영합니다.
```

그래서 실수로 이슈가 많이 생기는 것을 막을 수 있습니다.

## 2. 폴더별 역할

```text
2025-fall-planner/
  README.md
  config/
  scripts/
  .github/
  docs/
```

### 루트 폴더

- `README.md`: 프로젝트 소개와 실행 방법
- `package.json`: 자주 쓰는 Node 명령어 모음
- `labels.json`: GitHub 라벨 이름과 색상
- `bootstrap.sh`: 라벨과 마일스톤을 한 번에 준비하는 실행 스크립트

### config

설정 데이터가 들어있는 폴더입니다.

- `semester.json`: 과목, 주차, 과제, 마감일, 목표를 적는 핵심 파일

이 프로젝트에서 가장 먼저 봐야 하는 파일입니다. 실제 이슈 내용은 대부분 여기서 만들어집니다.

### scripts

자동화를 실제로 수행하는 Node.js 스크립트 폴더입니다.

```text
validate-config.mjs       설정 파일이 올바른지 검사합니다.
sync-labels.mjs           labels.json을 읽고 GitHub 라벨을 만듭니다.
sync-milestones.mjs       semester.json을 읽고 GitHub 마일스톤을 만듭니다.
create-weekly-issues.mjs  semester.json을 읽고 GitHub 이슈를 만듭니다.
```

### scripts/lib

여러 스크립트가 같이 쓰는 공통 함수 폴더입니다.

- `config.mjs`: 설정 파일 읽기, 검증, 이슈 제목/본문 생성
- `gh.mjs`: GitHub CLI(`gh`) 실행을 감싸는 함수

### .github

GitHub 안에서 동작하는 설정 폴더입니다.

- `.github/ISSUE_TEMPLATE/study-task.yml`: 수동으로 이슈를 만들 때 보이는 폼
- `.github/workflows/weekly-plan.yml`: 버튼으로 라벨/마일스톤/이슈 생성을 실행하는 워크플로
- `.github/workflows/due-soon-reminder.yml`: 마감 임박/지연 이슈에 라벨과 댓글을 다는 워크플로
- `.github/workflows/label-done-on-close.yml`: 이슈를 닫으면 `done` 라벨을 붙이는 워크플로

## 3. 먼저 읽을 파일 순서

처음에는 아래 순서대로 읽는 것이 좋습니다.

```text
1. config/semester.json
2. scripts/lib/config.mjs
3. scripts/create-weekly-issues.mjs
4. scripts/sync-labels.mjs
5. scripts/sync-milestones.mjs
6. scripts/lib/gh.mjs
7. .github/workflows/weekly-plan.yml
```

## 4. 핵심 흐름: 이슈 생성

가장 중요한 명령어는 이것입니다.

```bash
node scripts/create-weekly-issues.mjs --week W1
```

이 명령은 실제 이슈를 만들지 않고 미리보기만 합니다.

실제로 만들려면 아래처럼 실행합니다.

```bash
node scripts/create-weekly-issues.mjs --week W1 --apply
```

실행 흐름은 아래와 같습니다.

```text
create-weekly-issues.mjs 실행
-> loadSemester()로 config/semester.json 읽기
-> validateSemester()로 설정 오류 검사
-> plannedTasks()로 W1 과제만 고르기
-> buildIssueTitle()로 이슈 제목 만들기
-> buildIssueBody()로 이슈 본문 만들기
-> gh issue create 실행
```

## 5. config/semester.json 이해하기

`semester.json`은 이 프로젝트의 데이터 원본입니다.

```json
{
  "semester": "2025 Fall",
  "courses": [],
  "taskTypes": [],
  "weeks": []
}
```

크게 세 부분이 중요합니다.

### courses

과목 목록입니다.

```json
{ "name": "네트워크소켓", "label": "네트워크소켓" }
```

`name`은 과제에 적는 과목명이고, `label`은 GitHub 라벨 이름입니다.

### taskTypes

과제 유형 목록입니다.

```json
["요약1p", "유형문제", "오답정리", "실습/코드", "모의고사"]
```

과제마다 이 중 하나를 사용합니다.

### weeks

주차와 과제 목록입니다.

```json
{
  "id": "W1",
  "title": "W1 (Sep29-Oct5)",
  "dueOn": "2025-10-05",
  "tasks": []
}
```

`tasks` 안의 항목 하나가 GitHub Issue 하나로 변합니다.

## 6. scripts/lib/config.mjs 이해하기

이 파일은 설정 파일을 읽고, 검증하고, 이슈 형태로 바꾸는 역할입니다.

중요한 함수는 네 개입니다.

```text
loadSemester()
validateSemester()
plannedTasks()
buildIssueTitle()
buildIssueBody()
```

### loadSemester()

`config/semester.json`을 읽어서 JavaScript 객체로 바꿉니다.

```text
파일 내용(JSON 문자열)
-> JSON.parse
-> JavaScript 객체
```

### validateSemester()

설정에 문제가 없는지 확인합니다.

예를 들어 이런 오류를 잡습니다.

```text
없는 과목명을 과제에 쓴 경우
없는 과제 유형을 쓴 경우
마감일 형식이 YYYY-MM-DD가 아닌 경우
주차 id가 중복된 경우
```

### plannedTasks()

전체 과제 중에서 필요한 과제만 골라냅니다.

```bash
--week W1
```

을 주면 W1 과제만 골라냅니다.

### buildIssueTitle()

과제를 GitHub 이슈 제목으로 바꿉니다.

```text
과목: 네트워크소켓
제목: TCP echo 서버와 클라이언트 구현

-> [네트워크소켓] TCP echo 서버와 클라이언트 구현
```

### buildIssueBody()

과제 정보를 GitHub 이슈 본문으로 바꿉니다.

```text
과목
작업 유형
목표 체크리스트
마감일
예상 시간
회고 영역
```

## 7. scripts/lib/gh.mjs 이해하기

이 파일은 Node.js에서 GitHub CLI를 실행하기 위한 도구입니다.

핵심은 `runGh()`입니다.

```text
dryRun=true  -> 명령어를 출력만 합니다.
dryRun=false -> 실제 gh 명령어를 실행합니다.
```

그래서 아래 명령은 미리보기만 합니다.

```bash
node scripts/create-weekly-issues.mjs --week W1
```

아래 명령은 실제 GitHub에 반영합니다.

```bash
node scripts/create-weekly-issues.mjs --week W1 --apply
```

## 8. 라벨과 마일스톤 흐름

### 라벨

```text
labels.json
-> sync-labels.mjs
-> gh label create
-> GitHub Labels
```

라벨은 과목, 유형, 상태를 구분하기 위해 씁니다.

### 마일스톤

```text
config/semester.json의 weeks
-> sync-milestones.mjs
-> gh api repos/:owner/:repo/milestones
-> GitHub Milestones
```

마일스톤은 W1, W2, W3처럼 주차별 묶음입니다.

## 9. GitHub Actions 흐름

`.github/workflows/weekly-plan.yml`은 GitHub 웹사이트에서 버튼으로 실행할 수 있는 자동화입니다.

```text
Actions 탭에서 weekly-plan 실행
-> 설정 검증
-> 라벨/마일스톤 준비
-> 선택한 week의 이슈 생성
```

입력값은 두 개입니다.

```text
apply=false -> 미리보기
apply=true  -> 실제 반영
week=W1     -> W1만 생성
week=all    -> 전체 생성
```

## 10. 공부하면서 직접 해볼 것

먼저 검증:

```bash
npm run validate
```

이슈 생성 미리보기:

```bash
node scripts/create-weekly-issues.mjs --week W2
```

라벨/마일스톤 미리보기:

```bash
bash bootstrap.sh
```

실제로 반영할 때:

```bash
bash bootstrap.sh --apply
node scripts/create-weekly-issues.mjs --week W2 --apply
```

## 11. 혼자 설명해보기

아래 질문에 답할 수 있으면 흐름을 이해한 것입니다.

1. `semester.json`은 어떤 역할을 하는가?
2. `--apply`가 없을 때와 있을 때 차이는 무엇인가?
3. `validateSemester()`는 왜 필요한가?
4. `plannedTasks()`는 어떤 과제를 골라내는가?
5. `buildIssueTitle()`과 `buildIssueBody()`는 각각 무엇을 만드는가?
6. `gh.mjs`를 따로 만든 이유는 무엇인가?
7. GitHub Actions의 `weekly-plan.yml`은 로컬 스크립트와 어떤 관계인가?

## 12. 다음에 추가해볼 기능

작게 개선해보면 좋은 기능입니다.

- 이미 생성된 이슈의 본문까지 업데이트하기
- `semester.json`에 우선순위 필드 추가하기
- 과제별 예상 시간을 합산해서 주차별 총 공부 시간 출력하기
- 마감일이 지난 과제를 별도 리포트로 출력하기
- `config/semester.json`에서 W4, W5를 추가하고 이슈 생성하기
