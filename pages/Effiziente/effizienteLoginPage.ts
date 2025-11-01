import { Page } from 'playwright';
import { InputText } from '../../components/InputText';
import { Button } from '../../components/Button';
import { Link } from '../../components/Link';
import { EffizienteBasePage } from './effizienteBasePage';

export class EffizienteLoginPage extends EffizienteBasePage {
    company: InputText = new InputText(this.page, this.annotationHelper, 'Company');
    user: InputText = new InputText(this.page, this.annotationHelper, 'User');
    password: InputText = new InputText(this.page, this.annotationHelper, 'Password');
    login: Button = new Button(this.page, this.annotationHelper, 'Login');
    forgotPassword: Link = new Link(this.page, this.annotationHelper, '#forgotPass', false);

    constructor(page: Page) {
        super(page, 'Login');
    }
}