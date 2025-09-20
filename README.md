[![Tests](https://github.com/effiziente1/playwrightSample/actions/workflows/main.yml/badge.svg)](https://github.com/effiziente1/playwrightSample/actions/workflows/main.yml)

# POC Accessibility testing tool and end-to-end tests with Playwright.

This boilerplate includes demos to test different testing scenarios with Playwright and an accessibility tool that generates reports for the accessibility bugs and options to copy the bugs.

# Example tests:

[Accessibility](./tests/Accessibility): Tool for accessibility testing with axe-core® for thorough accessibility checks. Axe-core® https://github.com/dequelabs/axe-core is a trademark of Deque Systems, Inc https://www.deque.com/ in the US and other countries. This includes a dashboard, videos with accessibility bugs, and copy bugs (POC).

[AI](./tests/AI): ZeroStep allows you to create your test with plain text: Fill out the form with realistic values.

[API](./tests/Api): Test to select a random item from e-commerce and generate pre-conditions or post-conditions with API. Includes fakerJS to generate random data for your tests.

[Basic](./tests/Basic): Basic login test to show the Page object model, test steps descriptions, reuse authenticated state by different users with global setup, and assertions.

[Excel](./tests/Excel): Test to check the export to Excel for a PrimeNG Table with ExcelJS.

[Fixture and LambdaTest](./tests/Fixture-LambdaTest): Use a fixture to connect your test with Lambdatest to test in different countries and browsers.

[Locale and Geo](./tests/LocaleGeo): Emulates another country, for example, de-DE.

[PDF](./tests/PDF): Test to check the export to PDF for a PrimeNG Table with pdfjs-dist.

[Qase](./tests/Qase): Modern test management tool for manual, automated tests and AI.

[Synthetic](./tests/Synthetic): Test to monitor your test with [PerfAgents](https://www.perfagents.com) and [Checkly](https://www.checklyhq.com).

[Visual testing & Mock](./tests/VisualTesting): Mock API for visual testing to get the same data for a dynamic dashboard

[Shard](./tests/Shard): Pipeline to execute your tests in different machines simultaneously with GitHub actions

[WebSockets](./tests/WebSocket): Examples to test websocket a chat and intercpet a websocket connection

# Required software

- Node js -> v.16 or above
- VS Code
- Playwright Vs Code Extension (Optional)

## Setup Playwright

Clone this repo and execute the next commands

Navigate to the folder and install the NPM packages

```console
npm install
```

Install Playwright browsers and dependencies

```console
npx playwright install
```

Add .env file with the next values:

```
BASE_URL='https://www.saucedemo.com'
USER_NAME=valid user in saucedemo
PASSWORD=password for sauce demo
LOCALE=locale to test. Valid values are: 'en-US', 'de-DE', 'es-MX'
EFFIZIENTE_API_URL='https://effizienteauthdemo.azurewebsites.net'
EFFIZIENTE_URL='https://effizientedemo.azurewebsites.net'
EFFIZIENTE_COMPANY='Demo'
EFFIZIENTE_NORMAL_USER='Demo'
EFFIZIENTE_NORMAL_PASSWORD='Demo'
EFFIZIENTE_ADMIN_USER='Admin'
EFFIZIENTE_ADMIN_PASSWORD='Admin'
WEBDRIVERIO_SHOP='https://shop.webdriver.io'
```

## Run tests

### Local

Execute the following command to run your tests:

Run tests

```console
npx playwright test
```

Run the test with UI mode.

```console
npx playwright test --ui
```

You can also run it with the Visual Code Extension.

You can see the reporter on the GitHub Pages:

https://effiziente1.github.io/playwrightSample/

Video with some explanation

https://youtu.be/0n1F_eMkUqE?si=m6sJGV42GgHnfpcs

### BrowserStack

To execute the tests on browserstack add the next .env variables

```
BROWSERSTACK_USERNAME=<your_username>
BROWSERSTACK_ACCESS_KEY=<your_access_key>
ADO_TOKEN=<ado_pat_token>
ALLURE_TOKEN=<allure_token>
# Store these in environment-specific .env files (e.g., .env.local, .env.ci) and never commit real values.
```


### Playwright workspace

To execute your tests on playwright workspaces add the next .env variables

```
PLAYWRIGHT_SERVICE_URL=your playwright service url

```


If you like any of my repos you can [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U1U2V3V)
