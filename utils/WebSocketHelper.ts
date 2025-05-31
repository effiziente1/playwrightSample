import { Page } from 'playwright';

export class WebSocketHelper {

    async setupWebSocketInterception(page: Page, wsUrlPattern: RegExp) {
        const route = await page.routeWebSocket(wsUrlPattern, ws => {
            try {
                const server = ws.connectToServer();
                server.onMessage(message => {
                    console.log(`Server: ${message}`);
                    ws.send(message);
                });
                ws.onMessage(message => {
                    console.log(`Client ${message}`);
                    server.send(message);
                });
            } catch (error) {
                console.error('WebSocket error', error);
                throw error;
            }
        });
        return route;
    }

}