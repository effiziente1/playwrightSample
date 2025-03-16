import { Locator } from '@playwright/test';

export interface ITable {
    /**
     * Click in edit by key 
     * @param keyValue 
     */
    clickInEditByKey(keyValue: number): Promise<void>;

    /**
     * Get columns headers
     * @returns columns headers
     */
    getColumnsHeaders(): Promise<string[]>;

    /**
     * Get the index of the column header
     * @param columnHeader Column header to get the index
     * @returns The column index
     */
    getColumnIndex(columnHeader: string): Promise<number>;

    /**
     * Get row with the value in the column index
     * @param value Value for the column index
     * @param index Column index to find the value
     * @returns the row for the column index
     */
    getRowByColumnIndex(value: string, index: number): Promise<Locator | null>;

    /**
     * Get total of rows
     * @returns get total of rows
     */
    getTotalRows(): Promise<number>;

    /**
     * Get row by key
     * @param key key to find
     * @param keyColumnTitle Key column header title
     * @returns the row for the key
     */
    getRowByKey(key: number, keyColumnTitle?: string): Promise<Locator | null>;

    /**
     * Get row values in a object from a row
     * @param row Row to get value
     * @returns row values as object
     */
    getRowValues(row: Locator | null): Promise<Record<string, string>>;

    /**
     * Get the rows of the table as an array of record <string, string>
     * @returns The rows in the table as an array of record with the header as properties and the row data as the value
     */
    getRowsValues(): Promise<Record<string, string>[]>;

    /**
     * Get rows values as an object finding the row with the key column
     * @param key Key to find the row
     * @param keyColumnTitle Key column header title
     * @returns 
     */
    getRowValuesByKey(key: number, keyColumnTitle?: string): Promise<Record<string, string>>;
}