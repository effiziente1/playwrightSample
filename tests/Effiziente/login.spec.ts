import { test } from '@playwright/test';
import { LoginPage } from '../../pages/Effiziente/loginPage';
import { DashboardPage } from '../../pages/Effiziente/dashboardPage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';

test.describe('Effiziente Login', () => {
    test('Login with valid credentials shows correct username and menu items',
        {
            tag: ['@Effiziente', '@Login'],
            annotation: [
                {
                    type: AnnotationType.Description,
                    description: 'Verify successful login with valid credentials'
                },
                {
                    type: AnnotationType.Precondition,
                    description: 'Environment variables for login credentials must be configured'
                }
            ]
        },
        async ({ page }) => {

            const loginPage = new LoginPage(page);
            const dashboardPage = new DashboardPage(page);

            console.log('Navigating to login page...');
            await loginPage.goTo();

            // Wait for the page to load
            await page.waitForLoadState('domcontentloaded');

            console.log('Page URL after navigation:', page.url());

            console.log('Attempting login...');
            await loginPage.login(
                process.env.EFFIZIENTE_COMPANY!,
                process.env.EFFIZIENTE_NORMAL_USER!,
                process.env.EFFIZIENTE_NORMAL_PASSWORD!
            );

            await dashboardPage.assertUserName(process.env.EFFIZIENTE_NORMAL_USER!);
            await dashboardPage.assertMenuItems();

        });
});