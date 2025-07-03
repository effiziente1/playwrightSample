import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import * as path from 'path';

export class PDFHelper {

    constructor() {
        // Set the worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
            path.dirname(require.resolve('pdfjs-dist/package.json')),
            'legacy/build/pdf.worker.mjs'
        );
    }

    async getRowValues(fileName: string, totalHeaders: number) {
        const fs = await import('fs/promises');
        const data = await fs.readFile(fileName);

        // Configure standard font data URL for this document
        const standardFontDataUrl = path.join(
            path.dirname(require.resolve('pdfjs-dist/package.json')),
            'standard_fonts/'
        );

        // Load the PDF document with font configuration
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(data),
            standardFontDataUrl: standardFontDataUrl,
            useSystemFonts: false
        });
        const pdf = await loadingTask.promise;

        const items: (TextItem | TextMarkedContent)[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            // Join all text items for the page
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageItems = content.items.filter((item: any) => item.str && item.str.trim() !== '');

            items.push(...pageItems);
        }
        if (items.length < totalHeaders) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keys = items.slice(0, totalHeaders).map(item => (item as any).str);
        const values = items.slice(totalHeaders);

        // Group values into records
        const records: Record<string, string>[] = [];
        for (let i = 0; i < values.length; i += totalHeaders) {
            const row = values.slice(i, i + totalHeaders);
            if (row.length < totalHeaders) break; // skip incomplete row
            const record: Record<string, string> = {};
            keys.forEach((key, idx) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                record[key] = (row[idx] as any).str;
            });
            records.push(record);
        }
        return records;
    }
}