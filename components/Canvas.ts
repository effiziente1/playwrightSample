import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';

/**
 * Canvas component representing a specific element on the page.
 */
export class Canvas extends BaseComponent {

    /**
     * Constructor
     * @param page Playwright page 
     * @param annotationHelper Annotation that stores steps and custom annotations
     * @param selector selector for the canvas element
     */
    constructor(page: Page, annotationHelper: AnnotationHelper, public selector: string) {
        super(page, annotationHelper, selector, 'generic');
    }

    /**
     * Wait until the canvas stops redrawing (e.g. a Chart.js entrance animation finishes)
     * by comparing its rendered pixels across consecutive animation frames.
     * @param timeout Max time to wait for the canvas to settle
     */
    async waitForStable(timeout = 5_000): Promise<void> {
        await this.addStepWithAnnotation(`Wait for ${this.name ?? this.selector} chart to stop animating`, async () => {
            await this.page.waitForFunction(
                (selector: string) => {
                    const win = window as Window & { __canvasStability?: Record<string, string> };
                    const canvas = document.querySelector(selector) as HTMLCanvasElement | null;
                    if (!canvas) return false;
                    const data = canvas.toDataURL();
                    win.__canvasStability ??= {};
                    const isStable = win.__canvasStability[selector] === data;
                    win.__canvasStability[selector] = data;
                    return isStable;
                },
                this.selector,
                { polling: 'raf', timeout },
            );
        });
    }
}