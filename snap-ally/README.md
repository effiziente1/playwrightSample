# snap-ally

A custom Playwright reporter for Accessibility testing using Axe-core, featuring:
- Beautiful HTML Reporting
- Visual Overlays (highlighting violations on the page)
- Screenshot capture of violations
- Azure DevOps (ADO) Integration
- **Configurable Axe Rules and Tags**

## Installation

```bash
npm install snap-ally --save-dev
```

## Setup

Add the reporter to your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['snap-ally', {
      outputFolder: 'a11y-report',
      colors: {
        critical: '#dc2626',
        serious: '#ea580c',
        moderate: '#f59e0b',
        minor: '#0ea5e9',
      }
    }]
  ],
});
```

## Usage

In your tests, use `scanA11y` to perform an accessibility audit:

```typescript
import { test } from '@playwright/test';
import { scanA11y } from 'snap-ally';

test('sample accessibility test', async ({ page }, testInfo) => {
  await page.goto('https://example.com');
  
  await scanA11y(page, testInfo, {
    // Optional configuration
    rules: {
      'color-contrast': { enabled: false }, // Disable specific rule
    },
    tags: ['wcag2a', 'wcag2aa'], // Filter by specific tags
    verbose: true
  });
});
```

## Configuration Options

| Option | Type | Description |
| --- | --- | --- |
| `include` | `string` | CSS selector to limit the scan to a specific element. |
| `verbose` | `boolean` | Whether to log violations to the console. Defaults to `true`. |
| `rules` | `object` | Axe-core rule configuration. |
| `tags` | `string[]` | List of Axe-core tags to run. |
| `axeOptions` | `object` | Additional Axe-core options. |

## License

ISC
