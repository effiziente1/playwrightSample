import * as fs from 'fs';
import * as path from 'path';
import { TestResult } from '@playwright/test/reporter';

/**
 * Utilities for managing and copying report assets like videos and screenshots.
 */
export class A11yReportAssets {

    /**
     * Copies a file from source to a destination folder.
     */
    copyToFolder(destFolder: string, srcPath: string, fileName?: string): string {
        if (!srcPath || !fs.existsSync(srcPath)) {
            return '';
        }
        
        const name = fileName || path.basename(srcPath);
        const destFile = path.join(destFolder, name);

        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        fs.copyFileSync(srcPath, destFile);
        return name;
    }

    /**
     * Copies the test video if available.
     * Includes a small retry to ensure Playwright has finished flushing the file.
     */
    async copyTestVideo(result: TestResult, destFolder: string): Promise<string> {
        const videoAttachments = result.attachments.filter(a => a.name === 'video');
        
        let bestVideo: string | null = null;
        let maxSize = -1;

        for (const attachment of videoAttachments) {
            if (!attachment.path) continue;

            // Retry logic: Wait for file to exist (up to 2 seconds)
            let exists = fs.existsSync(attachment.path);
            let attempts = 0;
            while (!exists && attempts < 10) {
                await new Promise(r => setTimeout(r, 200));
                exists = fs.existsSync(attachment.path);
                attempts++;
            }

            if (exists) {
                try {
                    const size = fs.statSync(attachment.path).size;
                    if (size > maxSize) {
                        maxSize = size;
                        bestVideo = attachment.path;
                    }
                } catch (err) {
                    console.error(`[SnapAlly] Error checking video stats: ${err}`);
                }
            } else {
                console.warn(`[SnapAlly] Video attachment path found but file missing: ${attachment.path}`);
            }
        }
        
        if (bestVideo) {
            try {
                return this.copyToFolder(destFolder, bestVideo);
            } catch (e) {
                console.error(`[SnapAlly] Failed to copy video: ${e}`);
                return path.basename(bestVideo); 
            }
        }
        return '';
    }

    /**
     * Copies all screenshots found in the test attachments.
     */
    copyScreenshots(result: TestResult, destFolder: string): string[] {
        return result.attachments
            .filter(a => a.name === 'screenshot')
            .map(a => {
                if (a.path) {
                    return this.copyToFolder(destFolder, a.path);
                } else if (a.body) {
                    return this.writeBuffer(destFolder, `screenshot-${Date.now()}.png`, a.body);
                }
                return '';
            })
            .filter(path => path !== '');
    }

    /**
     * Copies all PNG attachments to the report folder and returns their new names.
     */
    copyPngAttachments(result: TestResult, destFolder: string): { path: string, name: string }[] {
        return result.attachments
            .filter(a => a.name.endsWith('.png') && a.name !== 'screenshot')
            .map(a => {
                let name = '';
                if (a.path) {
                    name = this.copyToFolder(destFolder, a.path, a.name);
                } else if (a.body) {
                    name = this.writeBuffer(destFolder, a.name, a.body);
                }
                return name ? { path: name, name: a.name } : null;
            })
            .filter((item): item is { path: string, name: string } => item !== null);
    }

    /**
     * Copies all other attachments (traces, logs, etc.) to the report folder.
     */
    copyAllOtherAttachments(result: TestResult, destFolder: string): { path: string, name: string }[] {
        const excludedNames = ['screenshot', 'video', 'A11y'];
        return result.attachments
            .filter(a => !excludedNames.includes(a.name) && !a.name.endsWith('.png'))
            .map(a => {
                let name = '';
                if (a.path) {
                    name = this.copyToFolder(destFolder, a.path, a.name);
                } else if (a.body) {
                    name = this.writeBuffer(destFolder, a.name, a.body);
                }
                return name ? { path: name, name: a.name } : null;
            })
            .filter((item): item is { path: string, name: string } => item !== null);
    }

    /**
     * Writes a buffer to a file in the destination folder.
     */
    writeBuffer(destFolder: string, fileName: string, buffer: Buffer): string {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        const destFile = path.join(destFolder, fileName);
        fs.writeFileSync(destFile, buffer);
        return fileName;
    }
}
