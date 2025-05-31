
import { test, expect } from '@playwright/test';
import { ChatHomePage } from '../../pages/Chat/chatHomePage';

test('WebSockets Demo Chat Test', async ({ browser }) => {
    // Launch two browser contexts to simulate two different users
    const browserContext1 = await browser.newContext();
    const browserContext2 = await browser.newContext();

    // Create pages for each user
    const userPage1 = await browserContext1.newPage();
    const userPage2 = await browserContext2.newPage();

    // Set up WebSocket interception for User 1
    await userPage1.routeWebSocket(/websockets/, ws => {
        const server = ws.connectToServer();

        // Intercept server -> client messages
        server.onMessage(message => {
            console.log('User1 - Server:' + message);
            ws.send(message);
        });

        // Forward client -> server messages without modification
        ws.onMessage(message => {
            console.log('User1 - Client:' + message);
            server.send(message);
        });
    });

    // Set up WebSocket interception for User 2
    await userPage2.routeWebSocket(/websockets/, ws => {
        const server = ws.connectToServer();

        // Intercept server -> client messages
        server.onMessage(message => {
            console.log('User2 - Server:' + message);
            ws.send(message);
        });

        // Forward client -> server messages without modification
        ws.onMessage(message => {
            console.log('User2 - Client:' + message);
            server.send(message);
        });
    });

    // Navigate both users to the WebSockets demo page
    const chat1 = new ChatHomePage(userPage1);
    const chat2 = new ChatHomePage(userPage2);

    await chat1.goTo();
    await chat2.goTo();

    // User 1 sends a message
    const user1Message = 'Hello from User 1!';
    await chat1.messageInput.fill(user1Message);
    await chat1.submit.click();

    await expect(chat1.message.first()).toHaveText(user1Message);
    await expect(chat2.message.first()).toHaveText(user1Message);

    // User 2 sends a response
    const user2Message = 'Hello back from User 2!';
    await chat2.messageInput.fill(user2Message);
    await chat2.submit.click();

    await expect(chat1.message.nth(1)).toHaveText(user2Message);
    await expect(chat2.message.nth(1)).toHaveText(user2Message);

    // Close contexts
    await browserContext1.close();
    await browserContext2.close();
});