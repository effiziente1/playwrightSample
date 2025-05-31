import { Page } from 'playwright';
import { BasePage } from '../basePage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { InputText } from '../../components/InputText';
import { Button } from '../../components/Button';

export class ChatHomePage extends BasePage {
    messageInput = new InputText(this.page, this.annotationHelper, 'Message');
    submit = new Button(this.page, this.annotationHelper, 'Submit');
    message = this.page.locator('#messages td');

    constructor(page: Page) {
        super(page, 'Chat');
    }

    async goTo() {
        const url = 'https://websockets.thecodeboss.dev/';
        await this.addStepWithAnnotation(AnnotationType.GoTo, `Go to: "${url}"`, async () => {
            await this.page.goto(url);
        });
    }

}