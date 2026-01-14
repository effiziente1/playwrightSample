import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';
import { AnnotationHelper } from '../utils/annotations/AnnotationHelper';
import { ITable } from './interfaces/iTable';

export class Table extends BaseComponent implements ITable {

    columnsText: string[];
    columnSelector = 'th';
    editButtonSelector = '[aria-label="Edit"]';
    rowSelector = 'tbody > tr';
    cellSelector = 'td';

    constructor(page: Page, annotationHelper: AnnotationHelper, selector = 'table') {
        super(page, annotationHelper, selector);
        this.columnsText = [];
    }

    /**
     * Get the rows of the table as an array of record <string, string>
     * @returns The rows in the table as an array of record with the header as properties and the row data as the value
     */
    async getRowsValues(): Promise<Record<string, string>[]> {
        return await this.addStep('Get all the rows in the table', async () => {
            const rows: Record<string, string>[] = [];
            const totalRows = await this.getTotalRows();
            await this.getColumnsHeaders();

            //Starts in 1 to exclude header
            for (let i = 0; i < totalRows; i++) {
                let rowValues: Record<string, string> = {};
                const row = this.page.locator(this.rowSelector).nth(i);
                rowValues = await this.getRowValues(row);
                rows.push(rowValues);
            }
            return rows;
        });
    }

    /**
     * Get rows values as an object finding the row with the key column
     * @param key Key to find the row
     * @param keyColumnTitle Key column header title
     * @returns 
     */
    async getRowValuesByKey(key: number, keyColumnTitle = 'Key') {
        return await this.addStep(`Get the row values for the key: "${key}" in the column: "${keyColumnTitle}"`, async () => {
            const row = await this.getRowByKey(key, keyColumnTitle);
            const rowValues = await this.getRowValues(row);
            return rowValues;
        });
    }

    async clickInEditByKey(keyValue: number): Promise<void> {
        await this.addStep(`Click in the edit table for the row with the key: "${keyValue}"`, async () => {
            const row = this.page.getByRole('row', { name: keyValue.toString() });
            await row?.locator(this.editButtonSelector).click();
        });
    }
    async getColumnsHeaders(): Promise<string[]> {
        return await this.addStep('Get the columns headers of the table', async () => {
            const gridColumns = await this.page.locator(this.columnSelector).allInnerTexts();
            this.columnsText = [];
            for (let i = 0; i < gridColumns.length; i++) {
                const columnHeader = gridColumns[i].trim();
                if (columnHeader != '' && columnHeader != 'Actions') {
                    // Webkit adds '\n' so we need to remove 
                    this.columnsText.push(columnHeader.replace(/\n/g, ''));
                }
            }
            return this.columnsText;
        });
    }
    async getColumnIndex(columnHeader: string): Promise<number> {
        await this.getColumnsHeaders();
        const idIndex = this.columnsText.indexOf(columnHeader);
        return idIndex;
    }
    async getRowByColumnIndex(value: string, index: number): Promise<Locator | null> {
        return await this.addStep(`Get the row with the value: "${value}" in the column: "${index}"`, async () => {
            const rows = this.page.locator(this.rowSelector);
            const totalRows = await rows.count();
            for (let i = 0; i < totalRows; i++) {
                const row = rows.nth(i);
                const cellValue = await row.locator(this.cellSelector).nth(index).innerText();
                if (cellValue == value)
                    return row;
            }
            return null;
        });
    }
    async getTotalRows(): Promise<number> {
        return await this.addStep('Get total of rows in the table', async () => {
            const totalRows = await this.page.locator(this.rowSelector).count();
            return totalRows;
        });
    }
    async getRowByKey(key: number, keyColumnTitle = 'Key'): Promise<Locator | null> {
        return await this.addStep(`Get the row with the "${key}" in the column: "${keyColumnTitle}"`, async () => {
            const index = await this.getColumnIndex(keyColumnTitle);
            const row = await this.getRowByColumnIndex(key.toString(), index);
            return row;
        });
    }
    /**
     * Get row values in a object from a row
     * @param row Row to get value
     * @returns row values as object
     */
    async getRowValues(row: Locator | null) {
        return await this.addStep('Get the row values', async () => {
            const rowValues: Record<string, string> = {};
            const columnValues = await row?.locator(this.cellSelector).allInnerTexts();
            for (let i = 0; i < columnValues!.length; i++) {
                if (columnValues) {
                    let columnValue = columnValues[i].trim();
                    if (columnValue != '') {
                        rowValues[this.columnsText[i]] = columnValue;
                    }
                }
            }
            return rowValues;
        });
    }
}