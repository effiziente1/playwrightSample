import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { Server } from '../../api/Effiziente/Server';
import { ServersPage } from '../../pages/Effiziente/serversPage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { AddServerPage } from '../../pages/Effiziente/addServerPage';
import * as allure from 'allure-js-commons';

test.describe('Servers', () => {
    let id = 0;
    test.use({ storageState: 'auth/admin.json' });

    test.afterEach(async ({ page }) => {
        //Delete the server created after each test 
        const addServerPage = new AddServerPage(page);
        if (id > 0) {
            addServerPage.addAnnotation(AnnotationType.PostCondition, 'Delete the server with API request');
            await addServerPage.serverApi.deleteServer(id);
        }
    });

    test('Should add a server', {
        tag: ['@API'],
        annotation: [
            { type: AnnotationType.Description, description: 'An admin user can add a server' },
            { type: AnnotationType.Precondition, description: 'A valid admin username and password is logged' },
        ],
    }, async ({ page }) => {
        await allure.feature('API');
        await allure.suite('Effiziente Servers');
        const serversPage = new ServersPage(page);
        const addServerPage = new AddServerPage(page);
        await serversPage.goTo();
        //Add server with a random data from faker
        const key = faker.number.int({ min: 2, max: 999_999 });
        const name = faker.company.name();
        const url = faker.internet.url();
        //Delete a server with key if exists to isolate the test and can be executed in parallel
        await serversPage.deleteServerByKey(key.toString());
        await serversPage.add.click();
        await addServerPage.key.fill(key.toString());
        await addServerPage.name.fill(name);
        await addServerPage.url.fill(url);
        //Click and save and wait for the id returned by the api to delete this server
        await addServerPage.saveClick();
        await serversPage.checkSuccessMessage();
        await serversPage.filter.fill(key.toString());
        await expect(serversPage.table.locator).toContainText(key.toString());
        await serversPage.checkRow(key, name, url);
        const response = await serversPage.serverApi.getServerByKey(key.toString());
        const responseText = await response.text();
        const responseObject = JSON.parse(responseText);
        id = +responseObject.Id;
    });

    test('Should edit a server', {
        tag: ['@API'],
        annotation: [
            { type: AnnotationType.Description, description: 'An admin user can edit a server' },
            { type: AnnotationType.Precondition, description: 'A valid admin username and password is logged' },
        ],
    }, async ({ page }) => {
        await allure.feature('API');
        await allure.suite('Effiziente Servers');
        const serversPage = new ServersPage(page);
        const addServerPage = new AddServerPage(page);
        const key = faker.number.int({ min: 2, max: 999_998 });
        await serversPage.goTo();
        //Create and server by api to test edit to remove dependencies for the create with UI
        const server: Server = {
            Key: key,
            Name: faker.company.name(),
            Url: faker.internet.url(),
            Active: true
        };
        id = await serversPage.createServer(server);
        const newName = faker.company.name();
        const newUrl = faker.internet.url();
        //Go to page again to get the server created by api
        await serversPage.goTo();
        await serversPage.table.clickInEditByKey(key);
        await expect(addServerPage.name.locator).toHaveValue(server.Name);
        await addServerPage.name.fill(newName);
        await addServerPage.url.fill(newUrl);
        await addServerPage.save.click();
        await addServerPage.checkSuccessMessage();
        await serversPage.filter.fill(key.toString());
        await expect(serversPage.table.locator).toContainText(key.toString());
        await serversPage.checkRow(key, newName, newUrl);
    });

});