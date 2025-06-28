import test, { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

export class Button extends BaseComponent {


    /**
     * Constructor
     * @param page Playwright page 
     * @param annotationHelper Annotation that stores steps and custom annotations
     * @param selector Name for the button
     * @param byRole default to true. Allows to search byRole "button" instead of css selector
     */
    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true, name = '') {
        super(page, annotationHelper, selector, 'button', byRole, name);
    }

    /**
     * Click in a button
     */
    async click() {
        const stepDescription = `Click: "${await this.getName()}"`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.filter({ visible: true }).click();
        });
    }

    /**
     * Get the text or aria-label or title for the button
     * @returns Button text
     */
    override async getName(): Promise<string> {
        return await test.step('Get the button text', async () => {
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (this.name)
                return this.name;
            // eslint-disable-next-line playwright/no-conditional-in-test
            this.name = await this.locator.textContent() ?? '';
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (!this.name || this.name == '')
                // eslint-disable-next-line playwright/no-conditional-in-test
                this.name = await this.locator.getAttribute('aria-label') ?? '';
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (!this.name || this.name == '')
                // eslint-disable-next-line playwright/no-conditional-in-test
                this.name = await this.locator.getAttribute('title') ?? '';
            return this.name.trim();
        });
    }

}