import { Page, TestInfo } from '@playwright/test';
export interface AuditAnnotation {
    type: string;
    description: string;
    keyPage: string;
}
/**
 * Handles visual feedback and Playwright annotations during an accessibility audit.
 */
export declare class A11yAuditOverlay {
    protected page: Page;
    protected keyPage: string;
    private readonly overlayRootId;
    private auditAnnotations;
    constructor(page: Page, keyPage: string);
    reset(): void;
    /**
     * Shows a compact, modern banner at the bottom of the page describing the violation.
     */
    showViolationOverlay(violation: {
        id: string;
        help: string;
    }, color: string): Promise<void>;
    /**
     * Removes the violation description overlay.
     */
    hideViolationOverlay(): Promise<void>;
    /**
     * Attaches accessibility data to the Playwright test report.
     */
    addTestAttachment(testInfo: TestInfo, name: string, description: string): Promise<void>;
    getAuditAnnotations(): AuditAnnotation[];
    /**
     * Captures a screenshot and attaches it to the test report.
     */
    captureAndAttachScreenshot(fileName: string, testInfo: TestInfo): Promise<Buffer>;
    highlightElement(selector: string, color: string): Promise<void>;
    /**
     * Removes highlighting from an element.
     */
    unhighlightElement(): Promise<void>;
}
