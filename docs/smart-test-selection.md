# Smart Test Selection Guide

> Run only the tests that matter for your PR changes.

## The Problem

Running all tests on every PR is slow and wasteful. Most code changes only affect a small subset of tests.

## The Solution

**Coverage mapping** tracks which tests execute which source files. When a PR changes `src/auth.ts`, we only run tests that covered that file.

## How Coverage Mapping Works

### Step 1: Generate Coverage Maps

During test execution, we collect coverage data and map it to individual tests.

**Frontend Coverage** (from browser):
```typescript
// cypress/support/e2e.ts
afterEach(function () {
  if (Cypress.env('mapCoverage')) {
    cy.mapCoverage();  // Reads window.__coverage__
  }
});
```

**Backend Coverage** (from API):
```typescript
// Custom command in cypress/support/commands.ts
cy.mapCoverage = () => {
  // Fetch coverage from /__coverage__ endpoint
  // Map to current test name
  // Write to coverage-map.json
};
```

**Output**: `cypress/results/reports/coverage-map/coverage-map.json`
```json
{
  "src/containers/SignIn.tsx": {
    "cypress/src/ui/auth.spec.ts": {
      "user logs in successfully": 127,
      "shows error on invalid password": 89
    }
  },
  "backend/auth-routes.ts": {
    "cypress/src/api/auth.spec.ts": {
      "POST /login returns token": 45
    }
  }
}
```

### Step 2: Filter Specs Based on PR Changes

**Script**: `.github/scripts/cypress-src-to-specs-filter.py`

**Input**:
- Changed files from PR (via GitHub API)
- Coverage map JSON

**Logic**:
1. Read changed files: `['src/containers/SignIn.tsx', 'backend/auth-routes.ts']`
2. Look up specs in coverage map
3. Rank by coverage (statement count)
4. Output top specs

**Output**:
```bash
# GitHub Actions output
spec-paths=cypress/src/ui/auth.spec.ts,cypress/src/api/auth.spec.ts
run-flag=true
containers=2
```

### Step 3: Run Filtered Specs in CI

**Workflow**: `.github/workflows/cypress-pr-regression.yml`

```yaml
- name: Filter specs based on PR changes
  id: filter
  run: python .github/scripts/cypress-src-to-specs-filter.py
  env:
    PR_FILENAMES: ${{ steps.changed-files.outputs.all_changed_files }}
    MAP_FILE_PATH: cypress/results/reports/coverage-map/coverage-map.json

- name: Run filtered Cypress tests
  if: steps.filter.outputs.run-flag == 'true'
  run: npm run cypress:run -- --spec "${{ steps.filter.outputs.spec-paths }}"
```

## 🧪 Environment Variables

```bash
# Coverage
MAP_COVERAGE=true              # Frontend coverage mapping
MAP_NODE_COVERAGE=true         # Backend coverage mapping
```

## Edge Cases Handled

### No Coverage Map
- **Fallback**: Run all tests
- **Why**: First PR or coverage map not committed

### Changed Files Not in Map
- **Fallback**: Run all tests (IRL recommended to run a @smoke subset)
- **Why**: New files or files without test coverage

### Test-Only Changes
- **Behavior**: Run changed test specs
- **Why**: Test changes should be validated

### Config/Workflow Changes
- **Behavior**: Run all tests
- **Why**: Infrastructure changes affect everything

## Maintenance

### Update Coverage Map
Run full suite periodically (weekly/monthly) to refresh the map:
[coverage-map-generation.yml](../.github/workflows/coverage-map-generation.yml)

## Key Files

- **Coverage collection**: `cypress/support/commands.ts` → `cy.mapCoverage()`
- **Auto-collection hook**: `cypress/support/e2e.ts` → `afterEach`
- **Filter script**: `.github/scripts/cypress-src-to-specs-filter.py`
- **Workflow to update map**: `.github/workflows/coverage-map-generation.yml`
- **Workflow to run tests on PRs**: `.github/workflows/cypress-pr-regression.yml`
- **Coverage map**: `cypress/results/reports/coverage-map/coverage-map.json`
