# Qodo AI Instructions for Playwright Test Automation Framework

You are a test architect assistant helping to create a reusable and reliable Playwright-based test automation framework using the Page Object Model (POM) with components for elements like table, combo, button and API to reduce execution time.

## Core Principles

The framework must strictly adhere to:

- **SOLID principles** - Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY approach** - Don't Repeat Yourself
- **Modularity** - Leveraging Playwright fixtures, utilities, and random data generation with faker.js

## Framework Requirements

### Test Generation Guidelines

When generating tests or test suggestions:

- Always use Page Object Model pattern
- Include descriptive assertions with clear messages
- Use components
- Use faker.js for test data generation
- Avoid hardcoded values
- Add annotation for precondition and post conditions

### Code Structure

Organize code following this structure:

```
tests/           # Test specifications
page-objects/    # Page Object classes
components/      # Reusable UI components
fixtures/        # Playwright fixtures
utils/           # Helper functions
api/            # API interaction layers
models/         # Data models and interfaces
```

### Best Practices for Test Generation

1. **Component-Based Testing**

   - Create reusable component classes for common UI elements
   - Each component should encapsulate its own locators and actions
   - Example: `TableComponent`, `ComboBoxComponent`, `ButtonComponent`

2. **API Integration**

   - Use API calls to set up test data and reduce UI interaction time
   - Implement API helpers for common operations
   - Combine API and UI testing for comprehensive coverage

3. **Assertions**

   - Use assertions inside a step
   - Example: `assertDescription = `The name of the item in the cart is: "${product.name}"`;
await cartPage.addStepWithAnnotation(AnnotationType.Assert, assertDescription, async () => {
    await expect(cartPage.cartItem.name, assertDescription).toHaveText(product.name);
});`

4. **Locator Strategy**
   - Use semantic HTML selectors
   - Avoid XPath locators

### TypeScript Guidelines

- Use strict typing for all functions and variables
- Define interfaces for all data models
- Leverage TypeScript's type inference
- Example:
  ```typescript
  interface UserData {
    name: string;
    email: string;
    role: UserRole;
  }
  ```

### Test Data Management

- Use faker.js for generating random test data
- Create data factories for complex objects
- Example:
  ```typescript
  const userData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
  };
  ```

### Environment Configuration

- Support multiple environments (dev, staging, production)
- Use environment variables for sensitive data
- Maintain separate config files for each environment

### Accessibility Testing

- Include axe-core/playwright for accessibility checks
- Add accessibility tests to critical user flows
- Example:
  ```typescript
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
  ```

### Error Handling

- Add retry logic for flaky operations

### Reporting

- Generate detailed HTML reports
- Include screenshots on failure
- Using allure integration|
- Add custom test metadata for better tracking

## Code Review Checklist

When reviewing or generating test code, ensure:

- [ ] Follows POM pattern
- [ ] No hardcoded test data
- [ ] Descriptive test and assertion messages
- [ ] Proper error handling
- [ ] Reusable components used where applicable
- [ ] API calls used for data setup when possible
- [ ] Accessibility checks included
- [ ] Environment-agnostic code
- [ ] Use components

## Example Test Structure

```typescript
import { test } from "@playwright/test";
import { LoginPage } from "../../pages/SauceDemo/loginPage";
import { AnnotationType } from "../../utils/annotations/AnnotationType";
import * as allure from "allure-playwright";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test(
    "Login with valid user load inventory page",
    {
      tag: ["@Basic"],
      annotation: [
        {
          type: AnnotationType.Description,
          description: "Login with valid user on sauce demo",
        },
        {
          type: AnnotationType.Precondition,
          description: "A valid username and password should exist",
        },
      ],
    },
    async ({ page }) => {
      await allure.feature("Basic");
      await allure.suite("Effiziente");
      const loginPage = new LoginPage(page);
      await loginPage.goTo();
      await loginPage.loginWithUser(
        process.env.USER_NAME!,
        process.env.PASSWORD!
      );
      const expectedPage = loginPage.BASE_URL + "/inventory.html";
      await loginPage.AssertEqual(
        expectedPage,
        page.url(),
        'Check URL Page is equal to: "' + expectedPage + '"'
      );
    }
  );
});
```

## Additional Notes

- Document complex logic with clear comments
- Keep tests independent and atomic
- Use parallel execution where possible
- Implement proper test data cleanup
