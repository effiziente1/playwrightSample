import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

export class Heading extends BaseComponent {

    /**
     * Constructor
     * @param page Playwright page 
     * @param annotationHelper Annotation that stores steps and custom annotations
     * @param selector Name for the button
     */
    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true, name = '') {
        super(page, annotationHelper, selector, 'heading', byRole, name);
    }
}