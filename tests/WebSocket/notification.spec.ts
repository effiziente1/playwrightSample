/* eslint-disable @typescript-eslint/no-explicit-any */


import { test, expect } from '@playwright/test';

test('WebSockets Demo Intercept', async ({ page }) => {
    await page.routeWebSocket(/stockticker/, ws => {
        const server = ws.connectToServer();

        // Intercept server -> client messages
        server.onMessage(message => {
            try {
                // Convert Buffer to string if necessary
                const messageStr = typeof message === 'string' ? message : message.toString();
                const data = JSON.parse(messageStr);
                let modified = false;

                // Handle initial stock data response
                if (data.R && Array.isArray(data.R)) {
                    data.R.forEach((stock: { Symbol: any; Price: number | undefined; Change: number; PercentChange: number; }) => {
                        if (stock.Symbol && stock.Price !== undefined) {
                            stock.Change = 1.00;
                            modified = true;
                        }
                    });
                }

                // Handle SignalR update messages
                if (data.C && data.M && Array.isArray(data.M)) {

                    data.M.forEach((messageItem: { H: string; M: string; A: any[]; }) => {
                        if (messageItem.H === 'stockTickerMini' &&
                            messageItem.M === 'updateStockPrice' &&
                            messageItem.A && Array.isArray(messageItem.A)) {

                            messageItem.A.forEach(stock => {
                                stock.Change = 1.00;
                                modified = true;
                            });
                        }
                    });
                }

                if (modified) {
                    ws.send(JSON.stringify(data));
                } else {
                    ws.send(message);
                }
            } catch (e) {
                console.log(e);
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

    await expect(row.locator('td').nth(3), 'Change should be 1 because was intercepted').toHaveText('▲ 1');
});