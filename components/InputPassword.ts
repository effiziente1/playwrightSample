import { Page } from '@playwright/test';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';
import { InputText } from './InputText';

export class InputPassword extends InputText {

    /**
     * Constructor
     * @param page Playwright page
     * @param annotationHelper annotation helper
     * @param selector Name or css locator for the link
     * @param [byRole=true] 
     * True - To locate by role/name
     * False - To locate by css selector
     * Default is True
    */
    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true) {
        super(page, annotationHelper, selector, byRole);
    }

    /**
     * Fill the password
     * @param value Password to fill
     */
    override async fill(value: string) {
        this.name = await this.getName();
        const stepDescription = `Fill "${this.name}" with value: *****`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.fill(value);
        });
    }
}