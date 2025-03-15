/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable playwright/no-conditional-in-test */
import { Locator, Page, test } from '@playwright/test';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

/**
 * Provides a foundational structure for UI components that can be reused for different components,
 * for example input text, combo box, calendar.
 * It integrates with AnnotationHelper to add annotations and highlights for debugging and reporting purposes.
 */
export class BaseComponent {
    locator: Locator;
    componentType: string;
    name?: string;
    protected isAnnotationEnabled = true;
    protected isHighlightEnabled = false;
    protected isDisplayStepEnabled = true;

    /**
   * Constructor for BaseComponent class.
   * @param page Playwright Page object
   * @param annotationHelper AnnotationHelper object
   * @param selector CSS selector or accessible name for the role lookup
   * @param role Accessibility role (default is 'generic')
   * @param byRole Flag to determine whether to locate by role (default is false)
   * @param name Optional name for the component
   */
    constructor(
        protected page: Page,
        protected annotationHelper: AnnotationHelper,
        selector: string,
        role:
            | 'alert'
            | 'alertdialog'
            | 'application'
            | 'article'
            | 'banner'
            | 'blockquote'
            | 'button'
            | 'caption'
            | 'cell'
            | 'checkbox'
            | 'code'
            | 'columnheader'
            | 'combobox'
            | 'complementary'
            | 'contentinfo'
            | 'definition'
            | 'deletion'
            | 'dialog'
            | 'directory'
            | 'document'
            | 'emphasis'
            | 'feed'
            | 'figure'
            | 'form'
            | 'generic'
            | 'grid'
            | 'gridcell'
            | 'group'
            | 'heading'
            | 'img'
            | 'insertion'
            | 'link'
            | 'list'
            | 'listbox'
            | 'listitem'
            | 'log'
            | 'main'
            | 'marquee'
            | 'math'
            | 'meter'
            | 'menu'
            | 'menubar'
            | 'menuitem'
            | 'menuitemcheckbox'
            | 'menuitemradio'
            | 'navigation'
            | 'none'
            | 'note'
            | 'option'
            | 'paragraph'
            | 'presentation'
            | 'progressbar'
            | 'radio'
            | 'radiogroup'
            | 'region'
            | 'row'
            | 'rowgroup'
            | 'rowheader'
            | 'scrollbar'
            | 'search'
            | 'searchbox'
            | 'separator'
            | 'slider'
            | 'spinbutton'
            | 'status'
            | 'strong'
            | 'subscript'
            | 'superscript'
            | 'switch'
            | 'tab'
            | 'table'
            | 'tablist'
            | 'tabpanel'
            | 'term'
            | 'textbox'
            | 'time'
            | 'timer'
            | 'toolbar'
            | 'tooltip'
            | 'tree'
            | 'treegrid'
            | 'treeitem' = 'generic',
        byRole = false,
        name?: string
    ) {
        this.componentType = this.constructor.name;
        if (byRole) {
            this.locator = page.getByRole(role, { name: selector });
            this.name = selector;
        } else {
            this.locator = page.locator(selector);
            if (name !== undefined) {
                this.name = name;
            }
        }
    }

    /**
   * Add an annotation for the HTML reporter.
   * @param annotationDescription Description of the annotation to add
   */
    addAnnotation(annotationDescription: string): void {
        if (this.isAnnotationEnabled) {
            this.annotationHelper.addAnnotation(this.componentType, annotationDescription);
        }
    }

    /**
   * Check if the element is visible.
   * @returns A boolean promise indicating visibility.
   */
    async isVisible(): Promise<boolean> {
        return this.addStepWithAnnotation(`Check if the ${this.name} is visible`, async () => {
            return await this.locator.isVisible();
        });
    }

    /**
     * Executes a step function with a given description and returns its promise.
     * @param stepDescription Description of the step.
     * @param action Function that returns a promise.
     * @returns A promise resolving to the result of the action.
    */
    async addStepWithAnnotation(stepDescription: string, action: () => Promise<any>): Promise<any> {
        this.addAnnotation(stepDescription);
        return this.addStep(stepDescription, action);
    }

    /**
     * Encapsulate a function as a step in the HTML report.
     * @param stepDescription Step description.
     * @param stepFunction Function to encapsulate as step.
     * @returns Promise with step execution.
    */
    async addStep(stepDescription: string, stepFunction: () => Promise<any>): Promise<any> {
        await this.highlightStep(stepDescription);
        await this.showStep(stepDescription);
        return test.step(stepDescription, stepFunction);
    }

    /**
    * Displays a step description if enabled.
    * @param stepDescription Step description.
    */
    async showStep(stepDescription: string): Promise<void> {
        if (this.isDisplayStepEnabled) {
            await this.annotationHelper.addDescription(stepDescription, '#000000');
        }
    }

    /**
     * Disable annotations for the component.
    */
    disableAnnotations(): void {
        this.isAnnotationEnabled = false;
    }

    /**
     * Highlight a step for demo/debug purposes.
     * @param stepDescription Step description.
     */
    async highlightStep(stepDescription: string): Promise<void> {
        if (this.isHighlightEnabled) {
            await test.step(`Highlight: ${stepDescription}`, async () => {
                await this.locator.highlight();
                await this.annotationHelper.addDescription(stepDescription, '#00008B');
            });
        }
    }

    /**
     * Get the text content of the component.
     * @returns The component name as a promise string.
     */
    async getName(): Promise<string> {
        return test.step('Get the Name', async () => {
            if (this.name) return this.name;
            this.name = (await this.locator.textContent()) ?? '';
            return this.name.trim();
        });
    }
}