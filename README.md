# 2025-Fall Semester Planner (GitHub)

**기준일:** 2025-09-29 (Asia/Seoul)

이 리포지토리는 학기 일정/공부 과제를 **GitHub Issues + Milestones + Actions**로 관리하기 위한 자동화 템플릿입니다. `config/semester.json`에 과목, 주차, 과제를 적으면 라벨/마일스톤/이슈를 일관된 형식으로 생성할 수 있습니다.

## 빠른 시작

먼저 설정이 올바른지 확인합니다.

```bash
npm run validate
```

라벨/마일스톤 생성 미리보기:

```bash
bash bootstrap.sh
```

실제로 GitHub에 반영:

```bash
bash bootstrap.sh --apply
```

주간 이슈 생성 미리보기:

```bash
node scripts/create-weekly-issues.mjs --week W1
```

실제로 이슈 생성:

```bash
node scripts/create-weekly-issues.mjs --week W1 --apply
```

`--week`을 빼면 `config/semester.json`에 있는 모든 주차 과제를 대상으로 합니다.

## 설계 개요
- **Issues**: 과제/복습/모의고사 등 모든 작업을 이슈로 관리
- **Labels**: 과목/유형/상태를 색으로 구분
- **Milestones**: `config/semester.json`의 주차/중간고사 기간을 기준으로 생성
- **Actions**: 매일 마감 D-1/D-day/지연 이슈에 자동 코멘트 및 라벨링
- **Scripts**: 로컬 미리보기 후 `--apply`로 GitHub에 반영

## 파일 구조

```text
config/semester.json              # 과목, 주차, 주간 과제 설정
labels.json                       # GitHub 라벨 색상 설정
scripts/validate-config.mjs       # 설정 검증
scripts/sync-labels.mjs           # 라벨 생성/갱신
scripts/sync-milestones.mjs       # 마일스톤 생성/갱신
scripts/create-weekly-issues.mjs  # 주간 이슈 생성
.github/workflows/weekly-plan.yml # 수동 실행용 GitHub Actions
```

## 기본 라벨
- 과목: `그래픽스`, `네트워크소켓`, `R데이터분석`, `블록체인`, `기계학습`, `빅데이터분석`
- 유형: `요약1p`, `유형문제`, `오답정리`, `실습/코드`, `모의고사`
- 상태: `due-soon`, `overdue`, `done`

## 기본 마일스톤
- `W1 (Sep29-Oct5)` → due: 2025-10-05
- `W2 (Oct6-Oct12)` → due: 2025-10-12
- `W3 (Oct13-Oct19)` → due: 2025-10-19
- `Midterms (Oct20-Oct23)` → due: 2025-10-23

## 이슈 검색(북마크용)
- 이번주: `is:open milestone:"W3 (Oct13-Oct19)" sort:updated-desc`
- 과목별: `is:open label:그래픽스 sort:created-desc`
- 마감 임박: `is:open label:"due-soon" -label:"done" sort:updated-desc`
- 지연: `is:open label:"overdue" -label:"done" sort:updated-desc`

## GitHub Actions로 실행

Actions 탭에서 **weekly-plan** 워크플로를 수동 실행할 수 있습니다.

- `apply=false`: 생성될 라벨/마일스톤/이슈를 로그로만 확인
- `apply=true`: 실제 GitHub에 반영
- `week=W1`: 특정 주차만 생성
- `week=all`: 전체 주차 생성

---

### GitHub Projects(선택)
Projects(베타)를 쓰고 싶다면:
1) 새 Project 생성 → **Fields**에 `Status(단일선택)`, `Course(단일선택)`, `Type(단일선택)`, `Due(날짜)`, `Iteration(주간)` 추가  
2) **Views**: Board(칸반), Table, Roadmap(타임라인) 구성  
3) 이슈를 프로젝트에 추가하고, `Due`/`Iteration`으로 주간 뷰를 만들어 쓰면 편합니다.
