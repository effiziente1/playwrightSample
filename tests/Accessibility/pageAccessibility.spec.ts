
import { test } from '@playwright/test';
import { AnnotationHelper } from '../../utils/annotations/AnnotationHelper';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { checkAccessibility } from 'snap-ally';
import * as allure from 'allure-js-commons';
import { Login } from '../../api/Effiziente/Login';
import { EffizienteLoginPage } from '../../pages/Effiziente/effizienteLoginPage';

test.describe('Page A11y', {
    tag: ['@PageAccessibility'],
}, () => {

    // eslint-disable-next-line playwright/expect-expect
    test('Page', async ({ page }, testInfo) => {
        await allure.feature('Accessibility');
        await allure.suite('Custom Page');

        const pageToTest = process.env.PAGE_URL!;
        const annotationHelper = new AnnotationHelper(page, pageToTest);
        annotationHelper.addAnnotation(AnnotationType.GoTo, 'Go to: ' + pageToTest);
        await page.goto(pageToTest);
        await checkAccessibility(page, testInfo, { 
            consoleLog: true,
            rules: {
                'color-contrast': { enabled: true },
                'html-has-lang': { enabled: true }
            },
            tags: ['wcag2aa', 'wcag2a']
        });
    });

    // eslint-disable-next-line playwright/expect-expect
    test('Login', async ({ page }, testInfo) => {
        const pageToTest = process.env.EFFIZIENTE_URL!;
        const annotationHelper = new AnnotationHelper(page, pageToTest);
        annotationHelper.addAnnotation(AnnotationType.GoTo, 'Go to: ' + pageToTest);
        await page.goto(pageToTest);

        await checkAccessibility(page, testInfo, { 
            consoleLog: true,
        });
    
        let userLogin: Login = {
            Company: process.env.EFFIZIENTE_COMPANY!,
            UserName: process.env.EFFIZIENTE_NORMAL_USER!,
            Password: process.env.EFFIZIENTE_NORMAL_PASSWORD!,
            KeepSession: true,
            Code: 0
        };
        const loginPage = new EffizienteLoginPage(page);
        await loginPage.company.fill(userLogin.Company);
        await loginPage.user.fill(userLogin.UserName);
        await loginPage.password.fill(userLogin.Password);
        await loginPage.login.click();
        await checkAccessibility(page, testInfo, { 
            consoleLog: true,
            verbose: true
        });
    });

});