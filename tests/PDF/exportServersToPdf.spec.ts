
import { test } from '@playwright/test';
import { ServersPage } from '../../pages/Effiziente/serversPage';

test.describe('Servers', () => {
    test.use({ storageState: 'auth/admin.json' });

    test('Should export servers to Pdf', {
        tag: ['@Excel'],
    }, async ({ page }) => {
        const serversPage = new ServersPage(page);
        await serversPage.goTo();
        await serversPage.exportToPDF.click('servers.pdf');

    });

});