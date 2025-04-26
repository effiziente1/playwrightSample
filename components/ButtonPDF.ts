import { Page } from 'playwright';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';
import { PDFHelper } from '../utils/PDFHelper';
import { BaseComponent } from './BaseComponent';
import test from 'playwright/test';


export class ButtonPDF extends BaseComponent {

    fileName = '';

    private pdfHelper: PDFHelper;

    constructor(page: Page, annotationHelper: AnnotationHelper, selector: string, byRole = true) {
        super(page, annotationHelper, selector, 'button', byRole);
        this.pdfHelper = new PDFHelper();
    }

    async click(fileName: string) {
        this.fileName = fileName;
        const stepDescription = `Click: "${await this.getName()}"`;

        await this.addStepWithAnnotation(stepDescription, async () => {
            // Start waiting for download before clicking. Note no await.
            const downloadPromise = this.page.waitForEvent('download');
            await this.locator.click();
            const download = await downloadPromise;
            // Wait for the download process to complete and save the downloaded file somewhere.
            await download.saveAs(fileName);

            await test.step('Attach the Excel file to the reporter', async step => {
                //Attach the excel file to the reporter
                await step.attach(fileName, { path: fileName });
            });
        });
    }

    async getRowValues(fileName: string, totalHeaders: number) {
        return await this.pdfHelper.getRowValues(fileName, totalHeaders);
    }

}