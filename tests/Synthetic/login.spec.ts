import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('Synthetic login testing', () => {
    // eslint-disable-next-line playwright/expect-expect
    test(
        'Should show dashboard',
        {
            tag: ['@PerfAgents'],
        },
        async ({ page }) => {
            await allure.feature('Synthetic');
            await allure.suite('PerfAgents');
            await page.goto(process.env.EFFIZIENTE_URL!);

           
            await test.step('Fill company: ' + process.env.EFFIZIENTE_COMPANY, async () => {
                await page.getByLabel('Company').fill(process.env.EFFIZIENTE_COMPANY!);
            });

            await test.step('Fill user: ' + process.env.EFFIZIENTE_NORMAL_USER, async () => {
                await page.getByLabel('User').fill(process.env.EFFIZIENTE_NORMAL_USER!);
            });

            await test.step('Fill password with: ****', async () => {
                await page.getByPlaceholder('Password').fill(process.env.EFFIZIENTE_NORMAL_PASSWORD!);
            });

            await page.getByRole('button', { name: 'Login' }).click();

            await page.locator('app-card-pie canvas').click({ timeout: 35_000 });
        },
    );
});
