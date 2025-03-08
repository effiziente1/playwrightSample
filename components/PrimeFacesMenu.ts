import { Page } from '@playwright/test';
import { IMenu } from './IMenu';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';
import { BaseComponent } from './BaseComponent';

/**
 * PrimeFaces menu component.
 */
export class PrimeFacesMenu extends BaseComponent implements IMenu {

    constructor(protected page: Page, protected annotationHelper: AnnotationHelper) {
        const topMenuLocator = '[aria-level="1"][role="menuitem"]';
        super(page, annotationHelper, topMenuLocator);
    }

    /**
     * Get top menus
     * @returns Top menus texts
     */
    getTopMenus(): Promise<string[]> {
        const stepDescription = 'Get top menus';
        return this.addStepWithAnnotation(stepDescription, async () => {
            const menuTexts = await this.locator.allInnerTexts();
            return menuTexts.map(text => text.replace(/\n/g, ''));
        });
    }
}
