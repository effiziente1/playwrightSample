import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

export class Link extends BaseComponent {

    /**
     * Constructor
     * @param page Page
     * @param annotationHelper Annotation that stores steps and custom annotations
     * @param selector Name or css locator for the link
     * @param [byRole=true] 
     * True - To locate by role/name
     * False - To locate by css selector
     */
    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true) {
        super(page, annotationHelper, selector, 'link', byRole);
    }

    /**
     * Click in the link
     */
    async click() {
        const linkText = await this.getName();
        const stepDescription = `Click: "${linkText}"`;
        await this.addStepWithAnnotation(stepDescription, async () => {
            await this.locator.click();
        });
    }

}