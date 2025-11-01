import { Page } from 'playwright';
import { InputText } from '../../components/InputText';
import { Button } from '../../components/Button';
import { EffizienteBasePage } from './effizienteBasePage';
import { MailTrapApi } from '../../api/Effiziente/MailTrap.api';
import { UsersApi } from '../../api/Effiziente/Users.api';

export class EffizienteForgotPassword extends EffizienteBasePage {
    email: InputText = new InputText(this.page, this.annotationHelper, 'Email');
    requestPassword: Button = new Button(this.page, this.annotationHelper, 'Request Password');
    mail: MailTrapApi = new MailTrapApi(this.page);
    usersApi: UsersApi = new UsersApi(this.page);

    constructor(page: Page) {
        super(page, 'Login');
    }
}