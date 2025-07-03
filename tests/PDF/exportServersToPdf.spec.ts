
import { expect, test } from '@playwright/test';
import { ServersPage } from '../../pages/Effiziente/serversPage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';


test.describe('Servers', () => {
    test.use({ storageState: 'auth/admin.json' });

    test('Should export servers to Pdf', {
        tag: ['@Excel'],
    }, async ({ page }) => {
        const serversPage = new ServersPage(page);
        await serversPage.goTo();
        expect(await serversPage.table.getTotalRows(), 'The number of rows should be at least one').toBeGreaterThanOrEqual(1);
        const gridRows = await serversPage.table.getRowsValues();
        const expectedTitles = ['Key', 'Name', 'Url', 'Active'];
        await serversPage.exportToPDF.click('servers.pdf');
        const pdfRows = await serversPage.exportToPDF.getRowValues('servers.pdf', expectedTitles.length);
        const assertDescription = 'The pdf file rows are equal to the grid rows';
        await serversPage.addStepWithAnnotation(AnnotationType.Assert, assertDescription, async () => {
            expect(pdfRows, 'The rows on the pdf are equal to the rows on the grid').toStrictEqual(gridRows);
        });
    });

});