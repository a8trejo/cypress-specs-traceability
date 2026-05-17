## AI Debugging

Once you are confident that you have a good test, you can debug it using the following steps:

- Add `.only` to the test before running it.

- Before running the test, let's always make sure that Cypress is closed using this command `osascript -e 'tell application "Cypress" to quit'` (macOS only).

- Run the appropriate npm script to execute the test, for example:
  ```bash
  npm run cypress:open
  ```
  or for headless mode:
  ```bash
  npm run cypress:run -- --spec 'cypress/src/ui/auth.spec.ts'
  ```
  Replace the spec file with the one you're working on.

- Monitor the test execution and check for failures. Look for:
  - `cypress/results/reports/verbose/verbose-metadata.json` to know the test results
  - Read the respective `domFile` of the failure (example: `cypress/results/reports/verbose/dom-2025-12-22T19-04.html`)
  - Screenshots in `cypress/results/screenshots` or `cypress/screenshots`

- Whenever a test run completes, if it fails, all the screenshots should be available. Read the latest image file to get a better perspective on the possible failure.

- Whenever you analyze these screenshots, always expect to see the Cypress runner, or the application under test, or API calls.

- Once you've analyzed the screenshots and fixed any issues, always use this command `osascript -e 'tell application "Cypress" to quit'` to close Cypress (macOS only).

- Remove `.only` when you're done from the new tests once you've tested them.

## Debugging Tips

1. **Use cy.pause()**: Add `cy.pause()` in your test to pause execution and inspect the state
2. **Check Network Tab**: Use `cy.intercept()` to spy on network requests
3. **Verbose Logging**: Enable `cy.logger()` for detailed console output
4. **DOM Snapshots**: Review the DOM snapshot files for the exact state at failure
5. **Timing Issues**: If tests are flaky, add proper `cy.wait()` for intercepts or use `cy.get().should('be.visible')` assertions
6. **Data-testid**: Prefer `data-testid` selectors over CSS classes or IDs for stability

## Common Issues

### Element Not Found
- Check if the element exists in the DOM snapshot
- Verify the selector is correct
- Ensure proper wait conditions before interacting

### Timeout Errors
- Increase timeout for specific commands if needed
- Add proper intercepts and waits for API calls
- Check if the application is actually loading

### Flaky Tests
- Add explicit waits for dynamic content
- Use `should` assertions instead of `then` for retryability
- Avoid hard-coded waits (`cy.wait(5000)`)

### API Failures
- Check dev server logs for backend errors
- Verify API endpoints are correct
- Ensure test data is properly seeded
