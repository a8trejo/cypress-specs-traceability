# Cypress Ops Demo Repository

> Smart test selection + AI failure analysis + Allure reports. Run only what matters.

> **Note:** This demo is built on top of the [Cypress RealWorld App](https://github.com/cypress-io/cypress-realworld-app) — a full-stack payment application used as a playground to showcase advanced Cypress testing patterns and CI/CD workflows.

## Available Guides

1. **[Smart Test Selection](./docs/smart-test-selection.md)** - Coverage maps tell us which tests cover which code. PRs only run relevant specs.

2. **[AI Failure Analysis](./docs/ai-failure-analysis.md)** - AI (Kilo) CLI analyzes failures, determines root cause, assigns merge confidence scores, posts analysis as PR comment and blocks merge if confidence < threshold (default: 60%).

3. **[Allure Reports](https://python.plainenglish.io/from-tests-to-reports-hosting-playwright-traces-and-allure-reports-via-github-actions-c93a4f1877c3)** - Visual test reports deployed to GitHub Pages automatically.

## Example Execution
[PR#4 Real Bugs for Demo](https://github.com/a8trejo/cypress-specs-traceability/pull/4)

## Quick Setup

```bash
npm install
npm run dev:coverage  # Frontend: :3000, Backend: :3001
npm run cypress:open
```

## 🔧 Key Files

```
.github/
├── workflows/
│   ├── cypress-pr-regression.yml      # Main PR workflow
│   ├── cypress-ai-analysis.yml        # AI failure analysis
│   └── allure-gh-pages.yml            # Report deployment
├── scripts/
│   └── cypress-src-to-specs-filter.py # Spec filtering logic
└── actions/
    └── review-pr-changes/             # Smart PR comments/reviews
cypress/
├── support/
│   ├── commands.ts                    # cy.mapCoverage(), cy.writeVerboseReport
│   └── e2e.ts                         # Auto coverage collection hooks
└── results/reports/
    ├── coverage-map/                  # Generated maps
    ├── verbose/                       # Failure details (DOM, logs)
    └── allure-results/                # Allure raw data
```

## 🎨 Custom Cypress Commands

```typescript
// Map coverage for current test
cy.mapCoverage()

// Write verbose failure report (auto-called on failure)
cy.writeVerboseReport()
```

## 📖 More Docs

- [Authentication Setup](./docs/authentication.md)
- [Database & Seeding](./docs/database.md)
- [NPM Scripts](./docs/npm-scripts.md)
- [Code Coverage](./docs/code-coverage.md)

## 🔗 Resources

- [Original Cypress RWA](https://github.com/cypress-io/cypress-realworld-app)
- [Cypress Docs](https://docs.cypress.io)
- [Kilo CLI](https://github.com/kilocode/cli)
- [Allure Framework](https://allurereport.org)

---

**Built with** [Cypress](https://cypress.io) | **AI by** [Kilo](https://kilo.dev) | **Reports by** [Allure](https://allurereport.org)
