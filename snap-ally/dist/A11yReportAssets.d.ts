import { TestResult } from '@playwright/test/reporter';
/**
 * Utilities for managing and copying report assets like videos and screenshots.
 */
export declare class A11yReportAssets {
    /**
     * Copies a file from source to a destination folder.
     */
    copyToFolder(destFolder: string, srcPath: string, fileName?: string): string;
    /**
     * Copies the test video if available.
     * Includes a small retry to ensure Playwright has finished flushing the file.
     */
    copyTestVideo(result: TestResult, destFolder: string): Promise<string>;
    /**
     * Copies all screenshots found in the test attachments.
     */
    copyScreenshots(result: TestResult, destFolder: string): string[];
    /**
     * Copies all PNG attachments to the report folder and returns their new names.
     */
    copyPngAttachments(result: TestResult, destFolder: string): {
        path: string;
        name: string;
    }[];
    /**
     * Copies all other attachments (traces, logs, etc.) to the report folder.
     */
    copyAllOtherAttachments(result: TestResult, destFolder: string): {
        path: string;
        name: string;
    }[];
    /**
     * Writes a buffer to a file in the destination folder.
     */
    writeBuffer(destFolder: string, fileName: string, buffer: Buffer): string;
}
