# Page Object Model (POM) Summary

This document provides a summary of reusable page objects, components, and patterns used in the Cypress test suite.

## Overview

The Page Object Model (POM) is a design pattern that creates an object repository for storing all web elements. It helps reduce code duplication and improves test maintenance.

## Structure

```
cypress/
├── src/
│   ├── pages/          # Page objects for different pages
│   ├── components/     # Reusable component objects
│   └── specs/          # Test specifications
└── support/
    ├── commands.ts     # Custom Cypress commands
    └── utils.ts        # Utility functions
```

## Best Practices

### Creating Page Objects

1. **One class per page**: Each page should have its own class
2. **Encapsulate selectors**: Keep all selectors within the page object
3. **Expose methods, not elements**: Provide methods that perform actions
4. **Use data-testid**: Prefer `data-testid` attributes for stable selectors
5. **Return chainable objects**: Allow method chaining where appropriate

### Example Pattern

```typescript
export class ExamplePage {
    // Selectors
    private get submitButton() {
        return cy.get('[data-testid="submit-button"]')
    }

    private get emailInput() {
        return cy.get('[data-testid="email-input"]')
    }

    // Actions
    visit() {
        cy.visit('/example')
        return this
    }

    fillEmail(email: string) {
        this.emailInput.clear().type(email)
        return this
    }

    submit() {
        this.submitButton.click()
        return this
    }

    // Assertions
    assertSubmitSuccess() {
        cy.contains('Success').should('be.visible')
        return this
    }
}
```

## Available Page Objects

### Authentication Pages
- **SignInPage**: User login functionality
- **SignUpPage**: User registration functionality

### Main Application Pages
- **DashboardPage**: Main dashboard after login
- **TransactionPage**: Transaction management
- **UserSettingsPage**: User profile and settings

### Components
- **NavBar**: Navigation bar component
- **Modal**: Generic modal dialog component
- **Toast**: Toast notification component

## Custom Commands

Custom commands are defined in `cypress/support/commands.ts`:

- `cy.login(username, password)`: Authenticate user
- `cy.logout()`: Log out current user
- `cy.writeVerboseReport()`: Write detailed test failure reports
- `cy.logger()`: Enhanced logging utility
- `cy.mapCoverage()`: Map code coverage data

## Utilities

Utility functions in `cypress/support/utils.ts`:

- `isMobile()`: Check if running in mobile viewport
- `formatDate()`: Date formatting helpers
- `generateTestData()`: Test data generation

## Notes

- Always update this document when adding new page objects or significant patterns
- Keep page objects focused and single-responsibility
- Use TypeScript for better type safety and IDE support
- Follow the existing naming conventions and structure
