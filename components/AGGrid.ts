import { Table } from './Table';

export class AGGrid extends Table {
    columnsText: string[] = [];
    columnSelector = '.ag-header-cell-label';
    editButtonSelector = '.edit-btn';
    rowSelector = '.ag-body [role="row"]';
    cellSelector = '[role="gridcell"]';
}