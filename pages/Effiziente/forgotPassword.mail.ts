import { Page } from 'playwright';
import { EffizienteBasePage } from './effizienteBasePage';
import { Link } from '../../components/Link';

export class ForgotPasswordMail extends EffizienteBasePage {

    resetPassword: Link = new Link(this.page, this.annotationHelper, 'Reset password');
    constructor(page: Page) {
        super(page, 'Request Password');
    }

    getEmailTitle(user: string) {
        return this.page.getByText(`Hello ${user}! Forgot your password?`);
    }
}