/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

test('WebSockets Demo Intercept', async ({ page }) => {
    const MOCK_CHANGE_VALUE = 1;
    await page.routeWebSocket(/stockticker/, ws => {

        //Connect to the server
        const server = ws.connectToServer();

        // Intercept server -> client messages
        server.onMessage(message => {
            try {
                // Convert Buffer to string if necessary
                const messageStr = typeof message === 'string' ? message : message.toString();
                //Parse to JSON
                const data = JSON.parse(messageStr);

                // Change stock.Change to 1 to test with the UI with a fixed number
                if (data.R && Array.isArray(data.R)) {
                    data.R.forEach((stock: { Symbol: any; Price: number; Change: number; PercentChange: number; }) => {
                        stock.Change = MOCK_CHANGE_VALUE;
                    });
                }

                // Handle SignalR update messages
                if (data.C && data.M && Array.isArray(data.M)) {
                    //Change the stock.Change on the updateStockPrice method
                    data.M.forEach((messageItem: { H: string; M: string; A: any[]; }) => {
                        if (messageItem.H === 'stockTickerMini' &&
                            messageItem.M === 'updateStockPrice' &&
                            messageItem.A && Array.isArray(messageItem.A)) {
                            messageItem.A.forEach(stock => {
                                stock.Change = MOCK_CHANGE_VALUE;
                            });
                        }
                    });
                }

                ws.send(JSON.stringify(data));

            } catch (e) {
                //Log the error message
                console.error('Failed to parse websocket: ' + e);
                ws.send(message);
            }
        });

        // Forward client -> server messages without modification
        ws.onMessage(message => {
            server.send(message);
        });
    });

    await page.goto('https://stockticker.azurewebsites.net/');

    // Wait for the GOOG row to appear
    const row = page.getByRole('row', { name: 'GOOG' });
    await row.waitFor();

    await expect(row.locator('td').nth(3), 'Change should be 1 because was intercepted').toHaveText('▲ ' + MOCK_CHANGE_VALUE);
});