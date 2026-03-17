import { Page, expect } from '@playwright/test';
import { EffizienteBasePage } from './effizienteBasePage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { Heading } from '../../components/Heading';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import { Server } from '../../api/Effiziente/Server';
import { ServerApi } from '../../api/Effiziente/Server.api';
import { ButtonExcel } from '../../components/ButtonExcel';
import { ButtonPDF } from '../../components/ButtonPDF';
import { InputText } from '../../components/InputText';

export class ServersPage extends EffizienteBasePage {
    readonly title: Heading;
    readonly add: Button;
    readonly delete: Button;
    readonly exportToExcel: ButtonExcel;
    readonly exportToPDF: ButtonPDF;
    readonly table: Table;
    readonly save: Button;
    readonly cancel: Button;
    readonly filter: InputText;
    serverApi: ServerApi;

    constructor(page: Page) {
        super(page, 'Servers');
        this.title = new Heading(page, this.annotationHelper, 'Servers');
        this.add = new Button(page, this.annotationHelper, 'Add');
        this.delete = new Button(page, this.annotationHelper, 'Delete');
        this.exportToExcel = new ButtonExcel(page, this.annotationHelper, 'Excel');
        this.exportToPDF = new ButtonPDF(page, this.annotationHelper, 'PDF');
        this.table = new Table(page, this.annotationHelper);
        this.save = new Button(page, this.annotationHelper, 'Save');
        this.cancel = new Button(page, this.annotationHelper, 'Cancel');
        this.filter = new InputText(
            page,
            this.annotationHelper,
            '[placeholder="Filter results..."]',
            false,
        );
        this.serverApi = new ServerApi(page);
    }

    /**
     * Go to servers page
     */
    public async goTo() {
        const serversPage = this.baseURL + '/security/servers';
        await this.addStepWithAnnotation(
            AnnotationType.GoTo,
            `Go to the servers page: "${serversPage}"`,
            async () => {
                 const waitForServersPromise = this.serverApi.waitForGetServers();
                await this.page.goto(serversPage);
                await waitForServersPromise;
                await this.title.locator.waitFor({ timeout: 30_000 });
            },
        );
    }

    /**
     * Create a server by api
     * @param server Data for the server
     */
    async createServer(server: Server) {
        return await this.addStepWithAnnotation(
            AnnotationType.Step,
            'Create server with API',
            async () => {
                const response = await this.serverApi.createServer(server);
                const responseText = JSON.parse(await response.text());
                const id = +responseText.Id;
                return id;
            },
        );
    }

    /**
     * Check the values in the row grid
     * @param key key for the server
     * @param name name for the server
     * @param url url for the server
     */
    async checkRow(key: number, name: string, url: string) {
        let row = await this.table.getRowByKey(key);
        let assertDescription = `Server with the key: "${key}" exists in the table`;
        await this.addStepWithAnnotation(
            AnnotationType.Assert,
            assertDescription,
            async () => {
                expect(row, assertDescription).not.toBeNull();
                //Get the row values as a object the header title are the property of the object
                const rowValues = await this.table.getRowValues(row);
                assertDescription = `The server name for the key: "${key}" is: "${name}"`;
                await this.addStepWithAnnotation(
                    AnnotationType.Assert,
                    assertDescription,
                    async () => {
                        expect(rowValues.Name, assertDescription).toBe(name);
                    },
                );
                assertDescription = `The server url for the key: "${key}" is: "${url}"`;
                await this.addStepWithAnnotation(
                    AnnotationType.Assert,
                    assertDescription,
                    async () => {
                        expect(rowValues.URL, assertDescription).toBe(url);
                    },
                );
            },
        );
    }
    /**
     * Deletes the server by key if exists
     * @param key Server key to delete
     */
    async deleteServerByKey(key: string) {
        await this.addStepWithAnnotation(
            AnnotationType.PostCondition,
            `Delete server with the key: "${key}" if exists`,
            async () => {
                const response = await this.serverApi.getServerByKey(key);
                if (response.status() == 200) {
                    const responseText = JSON.parse(await response.text());
                    const id = +responseText.Id;
                    await this.serverApi.deleteServer(id);
                }
            },
        );
    }
}
