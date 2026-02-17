import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';

/**
 * Handles the rendering of HTML reports using EJS templates.
 */
export class A11yHtmlRenderer {

    /**
     * Renders an HTML template and saves it to the specified file.
     * @param templateName The template file name in the templates folder.
     * @param data The data object to pass to EJS.
     * @param outputFolder The folder where the rendered file will be saved.
     * @param outputFileName The full path of the output file.
     */
    async render(templateName: string, data: Record<string, unknown>, outputFolder: string, outputFileName: string) {
        // Resolve path relative to this file (dist/A11yHtmlRenderer.js)
        const templatePath = path.join(__dirname, 'templates', templateName);
        
        let templateContent = '';
        try {
            templateContent = fs.readFileSync(templatePath, 'utf8');
        } catch {
            throw new Error(`[A11yHtmlRenderer] Template not found: ${templatePath}`);
        }

        let html = '';
        try {
            html = ejs.render(templateContent, data);
        } catch (error) {
            console.error(`[A11yHtmlRenderer] EJS Render Error (${templateName}):`, error);
            throw error;
        }

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        
        fs.writeFileSync(outputFileName, html);
    }

    /**
     * Converts ANSI color codes to HTML spans for nicer error display.
     */
    ansiToHtml(text: string): string {
        const map: Record<string, string> = {
            '\u001b[30m': '<span style="color:black">',
            '\u001b[31m': '<span style="color:red">',
            '\u001b[32m': '<span style="color:green">',
            '\u001b[33m': '<span style="color:yellow">',
            '\u001b[34m': '<span style="color:blue">',
            '\u001b[35m': '<span style="color:magenta">',
            '\u001b[36m': '<span style="color:cyan">',
            '\u001b[37m': '<span style="color:white">',
            '\u001b[0m': '</span>',
            '\u001b[2m': '<span style="opacity:0.5">',
            '\u001b[22m': '</span>',
            '\u001b[39m': '</span>',
        };

        let result = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        for (const [code, tag] of Object.entries(map)) {
            result = result.split(code).join(tag);
        }
        return result;
    }
}
