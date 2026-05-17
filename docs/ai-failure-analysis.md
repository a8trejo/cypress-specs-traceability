# AI Failure Analysis Guide

> Let AI analyze test failures and decide if PRs should merge.

## The Problem

Test failures are noisy. Is it a real bug, a flaky test, or an environment issue? Humans waste time triaging ^^.

## The Solution

**AI CLI (Kilo Code)** analyzes failures with full context (screenshots, logs, diffs, PR changes, DOM snapshots) and outputs:
- Root cause analysis
- Failure type classification
- Merge confidence score (0-100%)

## How It Works

### Step 1: Collect Failure Context

When tests fail, we gather everything AI needs:

**Test Artifacts**:
- Screenshots (`.png`)
- Verbose failure reports (`.json`) with DOM snapshots
- Allure results (test metadata, timings)

**PR Context**:
- Changed files list
- Unified diff of changes
- Dev server logs (if applicable)

**Workflow**: `.github/workflows/cypress-ai-analysis.yml` run as part of `.github/workflows/cypress-pr-regression.yml`
```yaml
- name: Download test artifacts
  uses: actions/download-artifact@v7
  with:
    pattern: cypress-artifacts-*
    path: cypress/results

- name: Get PR Files
  run: gh pr view $PR_NUMBER --json files --jq '.files[].path'

- name: Get PR Diff
  run: gh pr diff $PR_NUMBER
```

### Step 2: Configure Kilo CLI

**Config**: `.github/assets/kilo-ci-openrouter.json`
```json
{
  "model": "{env:MODEL_NAME}",
  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "{env:OPENROUTER_API_KEY}"
      }
    }
  },
  "permission": {
    "bash": { "*": "allow", "rm *": "deny" },
    "edit": { "*": "allow" }
  }
}
```

**Environment**:
```yaml
env:
  MODEL_NAME: openrouter/anthropic/claude-opus-4.7  # Default
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

### Step 3: Run AI Analysis

**Prompt**: `prompts/analyze-test-failures.md` (custom per project)

**Execution**:
```yaml
- name: Setup Kilo CLI analysis inputs
  run: |
    mkdir -p cypress/results/reports
    echo "$PR_FILES" > cypress/results/reports/pr-files.txt
    echo "$PR_DIFF" > cypress/results/reports/pr-diff.txt
    cp .github/assets/kilo-ci-openrouter.json cypress/results/kilo.json

- name: Kilo CLI Failures Analysis
  working-directory: cypress/results
  run: kilo run --auto "$(cat $GITHUB_WORKSPACE/prompts/analyze-test-failures.md)"
```

**Kilo reads**:
- `reports/pr-files.txt` - Changed files
- `reports/pr-diff.txt` - Code changes
- `reports/allure-results/*.json` - Test results
- `screenshots/*.png` - Visual evidence
- `reports/verbose/*.json` - Detailed failures

**Kilo writes**:
- `failure-analysis.md` - Human-readable analysis
- `failure-metadata.json` - Structured data

### Step 4: Parse AI Output

**Metadata**: `cypress/results/failure-metadata.json`
```json
{
  "failureType": "tests-needs-updates",
  "mergeConfidence": 85,
  "reasoning": "API response changed, tests expect old format"
}
```

**Failure Types**:
- `real-bug` - Code change broke functionality
- `tests-needs-updates` - Tests need updating for intentional changes
- `flaky-test` - Non-deterministic failure
- `environment-issue` - CI/infra problem

**Merge Confidence**:
- `0-59%` - Block merge (likely real bug)
- `60-100%` - Allow merge (likely safe)

### Step 5: Enforce Merge Policy

```yaml
- name: Expect Cypress Status or Merge Confidence above threshold
  env:
    MERGE_CONFIDENCE_THRESHOLD: 60
  run: |
    MERGE_CONFIDENCE=$(jq -r '.mergeConfidence' failure-metadata.json)
    
    if [ "$MERGE_CONFIDENCE" -lt "$MERGE_CONFIDENCE_THRESHOLD" ]; then
      echo "::error ::Merge blocked: confidence ${MERGE_CONFIDENCE}%"
      exit 1
    else
      echo "::warning ::Merge allowed: confidence ${MERGE_CONFIDENCE}%"
      exit 0
    fi
```

### Step 6: Post Analysis to PR

**Action**: `.github/actions/review-pr-changes`

```yaml
- name: Comment PR with Analysis
  uses: ./.github/actions/review-pr-changes
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    pr_number: ${{ inputs.pr_number }}
    comment_body: ${{ steps.kilo_analysis.outputs.failure_analysis }}
    body_includes: '<!-- FAILURE_ANALYSIS_COMMENT -->'
    comment_only: 'true'
    delete_and_repost: 'true'
```

**Result**: AI analysis posted as PR comment, old comments deleted.

## Example Analysis Output

```markdown
## 🔍 Test Failure Analysis

**Failure Type**: `tests-needs-updates`  
**Merge Confidence**: 85%

### Root Cause
The PR changes the `/api/users` response format from:
```json
{ "users": [...] }
```
to:
```json
{ "data": [...] }
```

Tests in `cypress/src/api/users.spec.ts` expect the old format.

### Affected Tests
- ✗ `GET /users returns user list` - Expected `response.body.users`, got `undefined`

### Recommendation
Update test assertions to use `response.body.data` instead of `response.body.users`.

### Merge Decision
**ALLOW MERGE** - This is an intentional API change. Tests need updating, not a bug.
```

## Configuration

### Model Selection

**Default**: `openrouter/anthropic/claude-opus-4.7`

**Override** via GitHub repository variable:
```bash
# Settings → Secrets and variables → Actions → Variables
CYPRESS_KILO_MODEL=openrouter/anthropic/claude-sonnet-4.5
```

### Merge Confidence Threshold

**Default**: 60%

**Override** in workflow call:
```yaml
uses: ./.github/workflows/cypress-ai-analysis.yml
with:
  merge_confidence_threshold: 75  # Stricter
```

### Custom Analysis Prompt

Edit `prompts/analyze-test-failures.md` to customize AI behavior:
```markdown
You are analyzing Cypress test failures. Focus on:
1. Distinguishing real bugs from test maintenance
2. Identifying flaky tests
3. Providing actionable recommendations

Output format:
- failure-analysis.md (markdown for humans)
- failure-metadata.json (structured data)
```

## Key Files

- **Workflow**: `.github/workflows/cypress-ai-analysis.yml`
- **Kilo config**: `.github/assets/kilo-ci-openrouter.json`
- **Analysis prompt**: `prompts/analyze-test-failures.md`
- **PR comment action**: `.github/actions/review-pr-changes/action.yml`
- **Output**: `cypress/results/failure-analysis.md` + `failure-metadata.json`

## Cost Optimization

**Typical cost per analysis**: $0.10-0.50 (depends on model and context size)

**Reduce costs**:
1. Use cheaper models for simple failures
2. Limit PR diff size (skip large files)
3. Reduce screenshot resolution
4. Use `claude-sonnet` instead of `claude-opus` for most cases

