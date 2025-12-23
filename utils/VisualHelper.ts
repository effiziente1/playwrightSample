import { expect, Page, test } from '@playwright/test';
import { AnnotationHelper } from './annotations/AnnotationHelper';
import { AnnotationType } from './annotations/AnnotationType';

export class VisualHelper {

    protected annotationHelper = new AnnotationHelper(this.page, this.keyPage);

    constructor(private page: Page, private keyPage: string) {

    }

    /**
     * Check full page snapshot
     * @param snapshotName Snapshot name
     * @param timeout Max timeout
     * @param maxDiffPixelsRatio Max difference pixel ratio
     */
    async checkPageSnapshot(snapshotName: string, timeout = 5_000, maxDiffPixelsRatio = 100) {
        const stepDescription = 'Compare snapshot: ' + snapshotName + ' with maxDiffPixelsRatio: ' + maxDiffPixelsRatio;
        await this.annotationHelper.addAnnotation(AnnotationType.Step, stepDescription);

        await test.step(stepDescription, async () => {
            await expect(this.page).toHaveScreenshot(snapshotName, {
                timeout: timeout,
                maxDiffPixels: maxDiffPixelsRatio
            });
        });
    }
}