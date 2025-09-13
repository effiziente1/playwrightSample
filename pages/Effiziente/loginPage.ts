import { Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { InputText } from '../../components/InputText';
import { InputPassword } from '../../components/InputPassword';
import { Button } from '../../components/Button';
import { AnnotationHelper } from '../../utils/annotations/AnnotationHelper';

export class LoginPage extends BasePage {
    readonly companyInput: InputText;
    readonly userInput: InputText;
    readonly passwordInput: InputPassword;
    readonly loginButton: Button;

    constructor(page: Page) {
        super(page, 'LoginPage');
        this.annotationHelper = new AnnotationHelper(page, 'LoginPage');
        this.companyInput = new InputText(page, this.annotationHelper, 'Company', true);
        this.userInput = new InputText(page, this.annotationHelper, 'User', true);
        this.passwordInput = new InputPassword(page, this.annotationHelper, 'Password', true);
        this.loginButton = new Button(page, this.annotationHelper, 'Login', true);
    }

    async goTo() {
        await this.page.goto(process.env.EFFIZIENTE_URL!);
    }

    async login(company: string, user: string, password: string) {
        await this.companyInput.fill(company);
        await this.userInput.fill(user);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}