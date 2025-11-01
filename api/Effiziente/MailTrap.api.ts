
import { Page } from 'playwright';
import { AnnotationHelper } from '../../utils/annotations/AnnotationHelper';
import { ApiHelper } from '../../utils/ApiHelper';
import test from 'playwright/test';

export class MailTrapApi {

    private apiHelper: ApiHelper;
    private annotationHelper: AnnotationHelper;
    private account: number;
    private mailInbox: number;
    private token: string;
    private apiUrl: string;

    constructor(private page: Page) {
        this.apiUrl = process.env.MAIL_TRAP_API ?? '';
        this.account = parseInt(process.env.MAIL_ACCOUNT ?? '0');
        this.mailInbox = parseInt(process.env.MAIL_INBOX ?? '0');
        this.token = process.env.MAIL_TOKEN ?? '';
        this.annotationHelper = new AnnotationHelper(this.page, 'login');
        this.apiHelper = new ApiHelper(this.page, this.apiUrl, this.annotationHelper);
    }

    async getLastEmailWithTitle(title: string) {
        return await test.step(`Get the last email with the title "${title}"`, async () => {
            const response = await this.apiHelper.get(`api/accounts/${this.account}/inboxes/${this.mailInbox}/messages`, this.token);
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (response.status() == 200) {
                const mails = JSON.parse(await response.text());
                const lastMail = mails.filter((m: { subject: string; }) => m.subject == title)[0];
                // eslint-disable-next-line playwright/no-conditional-in-test
                if (lastMail)
                    return lastMail;
            }
            return response;
        });
    }

    async getEmail(path: string) {
        await test.step(`Get the email from path "${path}"`, async () => {
            await this.page.goto(this.apiUrl + path);
        });
    }


}