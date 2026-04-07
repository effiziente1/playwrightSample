import test, { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

export class InputText extends BaseComponent {
    /**
     * Constructor
     * @param page Page
     * @param annotationHelper Annotation that stores steps and custom annotations
     * @param selector Name or locator for the text box
     * @param [byRole=true] 
     * True - To locate by role/name
     * False - To locate by css selector
    */
    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true) {
        super(page, annotationHelper, selector, 'textbox', byRole);
    }

    /**
     * Fill the value for the input text
     * @param value Value to fill
     */
    async fill(value: string) {
        this.name = await this.getName();
        const stepDescription = `Fill "${this.name}:" with the value: "${value}"`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.fill(value);
        });
    }

    async clear() {
        this.name = await this.getName();
        const stepDescription = `Clear "${this.name}"`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.clear();
        });
    }

    async type(value: string) {
        this.name = await this.getName();
        const stepDescription = `Type "${this.name}:" with the value: "${value}"`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.pressSequentially(value);
        });
    }

    /**
     * Get the placeholder, label, aria-label for an input element.
     * @returns Promise with input label
     */
    override async getName(): Promise<string> {
        return await test.step('Get the name for the input', async () => {
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (this.name)
                return this.name;

            const id = await this.locator.getAttribute('id');
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (id) {
                const labelElement = this.page.locator(`label[for="${id}"]`);
                // eslint-disable-next-line playwright/no-conditional-in-test
                if (await labelElement.isVisible())
                    return await labelElement.innerText();
            }

            const placeHolderAttribute = await this.locator.getAttribute('placeholder');
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (placeHolderAttribute)
                return placeHolderAttribute;

            const ariaLabelAttribute = await this.locator.getAttribute('aria-label');
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (ariaLabelAttribute)
                return ariaLabelAttribute;
            return '';
        });
    }
}