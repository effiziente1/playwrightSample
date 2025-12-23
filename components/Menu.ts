import { Page } from 'playwright';
import { BaseComponent } from './BaseComponent';
import { IMenu } from './interfaces/iMenu';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

export class Menu extends BaseComponent implements IMenu {

    constructor(protected page: Page, protected annotationHelper: AnnotationHelper) {
        const topMenuLocator = '.main-menubar';
        super(page, annotationHelper, topMenuLocator);
    }

    getMenus(): Promise<string[]> {
        const stepDescription = 'Get top menus';
        return this.addStepWithAnnotation(stepDescription, async () => {
            const menuTexts = await this.locator.locator('.menu-item-with-submenu').allInnerTexts();
            return menuTexts.map(text => text.replace(/\n/g, ''));
        });
    }
}