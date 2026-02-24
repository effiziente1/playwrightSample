import * as fs from 'fs';
import * as path from 'path';
import { TestResult } from '@playwright/test/reporter';

export class FileHelper {

    folderResults = 'steps-report/';

    /**
     * Copies the video attachment from the test result to the specified destination folder.
     *
     * @param {TestResult} result - The test result object containing attachments.
     * @param {string} destFolder - The destination folder where the video will be copied.
     * @returns {string | undefined} - The path to the copied video file, or undefined if no video attachment is found.
     */
    copyFileToResults(destFolder: string, srcPath: string) {
        if (srcPath == '')
            return '';
        const fileName = path.basename(srcPath);
        const destDir = path.resolve(__dirname, '..', destFolder);
        const destFile = path.join(destDir, fileName);

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(srcPath, destFile);
        return fileName;
    }

    /**
     * Copies a video from the test result attachments to the specified destination folder.
     *
     * This function filters the attachments in the provided `TestResult` object to find the one
     * with the name 'video'. It then extracts the path of this video and copies it to the specified
     * destination folder using the `copyFileToResults` method.
     *
     * @param {TestResult} result - The test result object containing attachments.
     * @param {string} destFolder - The destination folder where the video should be copied.
     * @returns {string} - The path of the copied video in the destination folder, or an empty string if no video attachment is found.
     */
    copyVideo(result: TestResult, destFolder: string) {
        const videoPath = result.attachments.find(attachment => attachment.name === 'video')?.path;
        if (videoPath) {
            const copiedVideoPath = this.copyFileToResults(destFolder, videoPath);
            return copiedVideoPath;
        }
        return '';
    }

    /**
     * Copies screenshots from the test result attachments to the specified destination folder.
     *
     * This function filters the attachments in the provided `TestResult` object to find those
     * with the name 'screenshot'. It then extracts the paths of these screenshots and copies
     * each screenshot to the specified destination folder.
     *
     * @param {TestResult} result - The test result object containing attachments.
     * @param {string} destFolder - The destination folder where the screenshots will be copied.
     * @returns {string[]} An array of paths to the copied screenshot files in the destination folder.
     */
    copyScreenshots(result: TestResult, destFolder: string) {
        const screenshotPaths: string[] = result.attachments.filter(attachment => attachment.name === 'screenshot')
            .map(attachment => attachment.path ?? '') ?? [];
        return screenshotPaths.map(screenshotPath => this.copyFileToResults(destFolder, screenshotPath));
    }

    copyFileTo(destFolder: string, srcPath: string, fileName: string) {
        if (srcPath === '') {
            return '';
        }

        const destDir = path.resolve(__dirname, '..', destFolder);
        const destFile = path.join(destDir, fileName);

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(srcPath, destFile);
        return fileName;
    }
}