import { Locator, Page } from 'playwright';
import { EffizienteBasePage } from './effizienteBasePage';
import { Link } from '../../components/Link';

export class ForgotPasswordMail extends EffizienteBasePage {

    userTitle: Locator = this.page.getByText('Hello John Doe! Forgot your password?');
    resetPassword: Link = new Link(this.page, this.annotationHelper, 'Reset password');
    constructor(page: Page) {
        super(page, 'Login');
    }
}