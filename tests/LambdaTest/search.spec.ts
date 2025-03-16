import { test } from '@playwright/test';
import { HomePage } from '../../pages/LambdaTest/homePage';
import { SearchResultsPage } from '../../pages/LambdaTest/searchResultsPage';

test.describe('LambdaTest Search', () => {
    test('Search for MacBook Pro', async ({ page }) => {
        // Initialize pages
        const homePage = new HomePage(page);
        const searchResultsPage = new SearchResultsPage(page);

        // Navigate to LambdaTest site
        await homePage.goTo();

        // Search for MacBook Pro
        await homePage.searchProduct('MacBook Pro');

        // Verify MacBook Pro exists in results
        await searchResultsPage.verifyProductExists('MacBook Pro');
    });
});