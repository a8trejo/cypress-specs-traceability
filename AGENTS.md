# AI Coding Rules & Standards

- Never tell lies, nor make up things to say, always be honest and transparent
- Whenever proposing a change, on a scale 1-10, only proceed if your confidence level is above 7.
- Do not refactor code unless it's absolutely necessary or specifically asked for.
- Always be backwards compatible with any of your changes.
- Always keep [POM.md](./prompts/POM.md) up to date, it's a summary of reusable actions from the existing POMs, if a PR contains new methods within a POM file, please update [POM.md](./prompts/POM.md) as well.

### Code Conventions
<details open>

- When creating a new test, always review `cypress/src` to see if there's a similar test, if there's one, reuse whatever you can, **do not overwrite an existing test case**, always create a new one.
- Always follow the rules in `.prettierrc`, `eslint.config.mjs` and any linting configuration when writing the code.
- Never use `cy.get('element')` for selectors directly on the spec files, always add them to a page object file or use data-testid attributes.
- Always add at least 1 assertion for each page visited
- This project uses Page Object Model (POM) pattern where applicable. Reuse existing page objects or create new ones following the established patterns.
- There are custom commands available in `cypress/support/commands.ts` - reuse them or update them if you can.
- Feel free to reuse common utilities from `cypress/support/utils.ts` overall.
- Always try to use `data-testid` attributes to select elements when possible for more stable selectors.
- Always try to use `cy.intercept().as(alias)` to intercept network requests and `cy.wait(@alias)`, never use explicit waits unless you're debugging.
- Always write typescript code, do not use javascript.
- If, as part of a test, you need to send an API request, consider creating reusable API helper functions.
- Whenever you have changes ready for review, please run `npm run format` or equivalent formatting command to format the code.

</details>
