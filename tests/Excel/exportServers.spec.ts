
import { expect, test } from '@playwright/test';
import { ServersPage } from '../../pages/Effiziente/serversPage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import * as allure from 'allure-js-commons';

test.describe('Servers', () => {
    test.use({ storageState: 'auth/admin.json' });

    test('Should export servers to excel', {
        tag: ['@Excel'],
    }, async ({ page }) => {
        await allure.feature('Excel');
        await allure.suite('Effiziente Servers');
        const serversPage = new ServersPage(page);
        await serversPage.goTo();
        await expect(serversPage.table.element).toBeVisible();
        await serversPage.exportToExcel.click('servers.xlsx');
        const excelRows = await serversPage.exportToExcel.getExcelRows();
        const gridRows = await serversPage.table.getRowsValues();
        const assertDescription = `The excel file rows ${gridRows} are equal to the grid rows ${excelRows}`;
        await serversPage.addStepWithAnnotation(AnnotationType.Assert, assertDescription, async () => {
            expect(excelRows, 'The rows on the excel are equal to the rows on the grid').toStrictEqual(gridRows);
        });
    });
}); 