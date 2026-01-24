import { expect, Page } from '@playwright/test';
import { BasePage } from '../basePage';
import { Generic } from '../../components/Generic';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { Menu } from '../../components/Menu';

export class EffizienteBasePage extends BasePage {
    menu: Menu;
    baseURL: string;
    message = new Generic(
        this.page,
        this.annotationHelper,
        '[data-test="message"]',
        'Message',
    );

    constructor(
        page: Page,
    public readonly keyPage: string,
    ) {
        //We need the page, and a friendly name for the page to be used in reports
        super(page, keyPage);
        this.menu = new Menu(page, this.annotationHelper);
        if (!process.env.EFFIZIENTE_URL) {
            throw new Error('The environment variable EFFIZIENTE_URL must be set.');
        }
        this.baseURL = process.env.EFFIZIENTE_URL;
    }

    /**
   * Check if the success message is visible
   */
    async checkSuccessMessage() {
        const assertDescription = 'Success message is visible';
        await this.addStepWithAnnotation(
            AnnotationType.Assert,
            assertDescription,
            async () => {
                await expect(this.message.locator, assertDescription).toBeVisible();
            },
        );
    }

    public async goTo() {
        const url = this.baseURL;
        const stepDescription = `Go to: "${url}"`;
        await this.addStepWithAnnotation(
            AnnotationType.GoTo,
            stepDescription,
            async () => {
                await this.page.goto(url);
            },
        );
    }
}
