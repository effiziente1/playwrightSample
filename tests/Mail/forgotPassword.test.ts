import test, { expect } from 'playwright/test';
import { EffizienteLoginPage } from '../../pages/Effiziente/effizienteLoginPage';
import { EffizienteForgotPassword } from '../../pages/Effiziente/effizienteForgotPassword';
import { ForgotPasswordMail } from '../../pages/Effiziente/forgotPassword.mail';

test.describe('Forgot Password tests', () => {
    test.use({ storageState: 'auth/admin.json' });
    test('Check the forgot mail is send', {
        tag: ['@Mail'],
    }, async ({ page }) => {
        const loginPage = new EffizienteLoginPage(page);
        await loginPage.goTo();
        const forgotPasswordPage = new EffizienteForgotPassword(page);
        const user = await forgotPasswordPage.usersApi.getCurrentUser();
        await loginPage.forgotPassword.click();
        await forgotPasswordPage.email.fill(user!.Email);
        await forgotPasswordPage.requestPassword.click();
        await expect(forgotPasswordPage.message.locator, 'Forgot Password is visble').toBeVisible();
        const lastMail = await forgotPasswordPage.mail.getLastEmailWithTitle('Reset password request');
        const expectedUser = user!.Name;
        expect(lastMail.template_variables.user, `User should be ${expectedUser}`).toBe(expectedUser);
        await forgotPasswordPage.mail.getEmail(lastMail.html_path);
        const forgotPasswordMail = new ForgotPasswordMail(page);
        await expect(forgotPasswordMail.userTitle).toBeVisible();
        await expect(forgotPasswordMail.resetPassword.locator, 'Reset password is visble').toBeVisible();
    });
});