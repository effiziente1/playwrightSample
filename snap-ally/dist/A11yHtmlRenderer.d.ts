/**
 * Handles the rendering of HTML reports using EJS templates.
 */
export declare class A11yHtmlRenderer {
    /**
     * Renders an HTML template and saves it to the specified file.
     * @param templateName The template file name in the templates folder.
     * @param data The data object to pass to EJS.
     * @param outputFolder The folder where the rendered file will be saved.
     * @param outputFileName The full path of the output file.
     */
    render(templateName: string, data: Record<string, unknown>, outputFolder: string, outputFileName: string): Promise<void>;
    /**
     * Converts ANSI color codes to HTML spans for nicer error display.
     */
    ansiToHtml(text: string): string;
}
