import { Page } from '@playwright/test';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';
import { BaseComponent } from './BaseComponent';
import { IMenu } from './interfaces/iMenu';

/**
 * PrimeFaces menu component.
 */
export class MatMenu extends BaseComponent implements IMenu {

    constructor(protected page: Page, protected annotationHelper: AnnotationHelper) {
        const topMenuLocator = '.nav-menu .mdc-button__label';
        super(page, annotationHelper, topMenuLocator);
    }

    /**
     * Get top menus
     * @returns Top menus texts
     */
    getMenus(): Promise<string[]> {
        const stepDescription = 'Get top menus';
        return this.addStepWithAnnotation(stepDescription, async () => {
            const menuTexts = await this.locator.filter({ visible: true }).allInnerTexts();
            return menuTexts.map(text => text.replace(/\n/g, ''));
        });
    }
}
